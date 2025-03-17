use axum::{
    extract::{Multipart, State},
    http::StatusCode,
};
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, IntoActiveModel, ModelTrait,
    QueryFilter,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::HashSet, str, sync::Arc};

use crate::{
    api_error::ApiError,
    app_state::AppState,
    entities::{electricity_usage_record, gas_usage_record, heating_degree_day, site},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct SiteInformation {
    #[serde(rename = "site_name")]
    pub name: String,

    #[serde(rename = "floor_area_sq_mtrs")]
    pub floor_area_square_metre: Option<f64>,

    #[serde(rename = "uprn")]
    pub unique_property_reference_number: Option<String>,

    pub ni185_energy_user: Option<String>,

    #[serde(rename = "comments")]
    pub comment: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ElectricityUsageRecord {
    pub site_id: i32,
    pub start_year: i32,
    pub energy_usage_kwh: i32,
    pub cost_gbp: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GasUsageRecord {
    pub site_id: i32,
    pub start_year: i32,
    pub energy_usage_kwh: i32,
    pub cost_gbp: Option<f64>,
}

#[derive(Debug, Deserialize)]
struct ElectricityUsageRecordRaw {
    pub site_name: String,
    pub kwh: i32,
    pub cost: Option<f64>,
}

#[derive(Debug, Deserialize)]
struct GasUsageRecordRaw {
    pub site_name: String,
    pub kwh: i32,
    pub cost: Option<f64>,
}

/// Raw struct for "heating degree days"
#[derive(Debug, Deserialize)]
struct HeatingDegreeDayRaw {
    pub year: String,
    pub apr: Option<i32>,
    pub may: Option<i32>,
    pub jun: Option<i32>,
    pub jul: Option<i32>,
    pub aug: Option<i32>,
    pub sep: Option<i32>,
    pub oct: Option<i32>,
    pub nov: Option<i32>,
    pub dec: Option<i32>,
    pub jan: Option<i32>,
    pub feb: Option<i32>,
    pub mar: Option<i32>,
}

/// Final DB form
#[derive(Debug, Serialize, Deserialize)]
pub struct HeatingDegreeDay {
    pub start_year: i32,
    pub april: Option<i32>,
    pub may: Option<i32>,
    pub june: Option<i32>,
    pub july: Option<i32>,
    pub august: Option<i32>,
    pub september: Option<i32>,
    pub october: Option<i32>,
    pub november: Option<i32>,
    pub december: Option<i32>,
    pub january: Option<i32>,
    pub february: Option<i32>,
    pub march: Option<i32>,
}

/// This expects a `multipart/form-data` with fields:
/// - "category" : one of ["site-information", "electricity", "gas", "hdd"]
/// - "start_year": integer (used for electricity/gas/site-info if needed)
/// - "data": JSON payload
pub async fn handler(
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> Result<StatusCode, ApiError> {
    let mut category: Option<String> = None;
    let mut start_year: Option<i32> = None;
    let mut data_json: Option<Value> = None;

    // Extract fields from the multipart form
    while let Some(field) = multipart.next_field().await? {
        let field_name = field.name().unwrap_or("");
        match field_name {
            "category" => {
                let val_bytes = field.bytes().await?;
                category = Some(
                    str::from_utf8(&val_bytes)
                        .map_err(|_| ApiError::BadRequest("Invalid utf-8 in category".into()))?
                        .to_string(),
                );
            }
            "start_year" => {
                let val_bytes = field.bytes().await?;
                let s = str::from_utf8(&val_bytes)
                    .map_err(|_| ApiError::BadRequest("Invalid utf-8 in start_year".into()))?;
                start_year =
                    Some(s.parse::<i32>().map_err(|_| {
                        ApiError::BadRequest("start_year must be an integer".into())
                    })?);
            }
            "data" => {
                let val_bytes = field.bytes().await?;
                let parsed_json: Value = serde_json::from_slice(&val_bytes)
                    .map_err(|e| ApiError::BadRequest(format!("Invalid JSON in 'data': {e}")))?;
                data_json = Some(parsed_json);
            }
            _ => {}
        }
    }

    let category =
        category.ok_or_else(|| ApiError::BadRequest("Missing field: 'category'".into()))?;
    let start_year =
        start_year.ok_or_else(|| ApiError::BadRequest("Missing field: 'start_year'".into()))?;
    let data_json =
        data_json.ok_or_else(|| ApiError::BadRequest("Missing field: 'data'".into()))?;

    match category.as_str() {
        "site-information" => {
            println!(
                "Processing category: site-information with start_year: {} and data: {:?}",
                start_year, data_json
            );

            // Parse the incoming sites
            let sites: Vec<SiteInformation> = serde_json::from_value(data_json).map_err(|e| {
                ApiError::BadRequest(format!("Failed to parse SiteInformation array: {e}"))
            })?;

            // Upsert all sites from the request
            let mut seen_sites = HashSet::new();
            let mut uprns_in_input = HashSet::new();

            for site_info in &sites {
                // If we've already seen this site name, skip it
                if !seen_sites.insert(site_info.name.clone()) {
                    continue;
                }

                // Upsert the site
                upsert_site(&state, site_info).await?;

                // Collect the UPRN into our set of "kept" UPRNs
                if let Some(uprn) = &site_info.unique_property_reference_number {
                    uprns_in_input.insert(uprn.clone());
                }
            }

            // Delete any sites NOT in the input:
            //  - if a DB site has a UPRN not in uprns_in_input
            //  - or if it has no UPRN at all
            let db = &state.database_connection;
            let all_db_sites = site::Entity::find().all(db).await.map_err(|e| {
                ApiError::InternalServerError(format!("Failed to fetch all sites: {e}"))
            })?;

            for db_site in all_db_sites {
                let site_id = db_site.id;
                match db_site.unique_property_reference_number.clone() {
                    Some(db_uprn) => {
                        // If UPRN is not in input, delete site & usage
                        if !uprns_in_input.contains(&db_uprn) {
                            println!("Deleting site_id={} with UPRN='{}'", site_id, db_uprn);

                            electricity_usage_record::Entity::delete_many()
                                .filter(electricity_usage_record::Column::SiteId.eq(site_id))
                                .exec(db)
                                .await
                                .map_err(|e| {
                                    ApiError::InternalServerError(format!(
                                        "Failed to delete electricity usage for site_id={}: {e}",
                                        site_id
                                    ))
                                })?;

                            gas_usage_record::Entity::delete_many()
                                .filter(gas_usage_record::Column::SiteId.eq(site_id))
                                .exec(db)
                                .await
                                .map_err(|e| {
                                    ApiError::InternalServerError(format!(
                                        "Failed to delete gas usage for site_id={}: {e}",
                                        site_id
                                    ))
                                })?;

                            db_site.delete(db).await.map_err(|e| {
                                ApiError::InternalServerError(format!(
                                    "Failed to delete site_id={} uprn={}: {e}",
                                    site_id, db_uprn
                                ))
                            })?;
                        }
                    }
                    None => {
                        // If site has NO UPRN, we choose to delete it
                        println!("Deleting site_id={} because it has no UPRN", site_id);

                        electricity_usage_record::Entity::delete_many()
                            .filter(electricity_usage_record::Column::SiteId.eq(site_id))
                            .exec(db)
                            .await
                            .map_err(|e| {
                                ApiError::InternalServerError(format!(
                                    "Failed to delete electricity usage for site_id={}: {e}",
                                    site_id
                                ))
                            })?;

                        gas_usage_record::Entity::delete_many()
                            .filter(gas_usage_record::Column::SiteId.eq(site_id))
                            .exec(db)
                            .await
                            .map_err(|e| {
                                ApiError::InternalServerError(format!(
                                    "Failed to delete gas usage for site_id={}: {e}",
                                    site_id
                                ))
                            })?;

                        db_site.delete(db).await.map_err(|e| {
                            ApiError::InternalServerError(format!(
                                "Failed to delete site_id={} with no UPRN: {e}",
                                site_id
                            ))
                        })?;
                    }
                }
            }
        }

        "electricity" => {
            let raw_records: Vec<ElectricityUsageRecordRaw> = serde_json::from_value(data_json)
                .map_err(|e| {
                    ApiError::BadRequest(format!("Failed to parse electricity array: {e}"))
                })?;

            let mut seen_sites = HashSet::new();
            for raw in raw_records {
                if !seen_sites.insert(raw.site_name.clone()) {
                    continue;
                }
                let site_id = fetch_site_id_by_name(&state, &raw.site_name).await?;
                let record = ElectricityUsageRecord {
                    site_id,
                    start_year,
                    energy_usage_kwh: raw.kwh,
                    cost_gbp: raw.cost,
                };
                upsert_electricity_usage_record(&state, &record).await?;
            }
        }

        "gas" => {
            let raw_records: Vec<GasUsageRecordRaw> = serde_json::from_value(data_json)
                .map_err(|e| ApiError::BadRequest(format!("Failed to parse gas array: {e}")))?;

            let mut seen_sites = HashSet::new();
            for raw in raw_records {
                if !seen_sites.insert(raw.site_name.clone()) {
                    continue;
                }
                let site_id = fetch_site_id_by_name(&state, &raw.site_name).await?;
                let record = GasUsageRecord {
                    site_id,
                    start_year,
                    energy_usage_kwh: raw.kwh,
                    cost_gbp: raw.cost,
                };
                upsert_gas_usage_record(&state, &record).await?;
            }
        }

        "hdd" => {
            let raw_hdds: Vec<HeatingDegreeDayRaw> = serde_json::from_value(data_json)
                .map_err(|e| ApiError::BadRequest(format!("Failed to parse HDD array: {e}")))?;

            let mut seen_years = HashSet::new();

            for raw_hdd in raw_hdds {
                // "year" might be "2017-2018" - we only need the first part as start_year
                let Some(first_part) = raw_hdd.year.split('-').next() else {
                    return Err(ApiError::BadRequest(format!(
                        "Invalid HDD year format: {}",
                        raw_hdd.year
                    )));
                };

                let parsed_start_year = first_part.parse::<i32>().map_err(|_| {
                    ApiError::BadRequest(format!(
                        "Failed to parse HDD start_year from {}",
                        raw_hdd.year
                    ))
                })?;

                if !seen_years.insert(parsed_start_year) {
                    continue;
                }

                // Build the final HDD struct
                let hdd = HeatingDegreeDay {
                    start_year: parsed_start_year,
                    april: raw_hdd.apr,
                    may: raw_hdd.may,
                    june: raw_hdd.jun,
                    july: raw_hdd.jul,
                    august: raw_hdd.aug,
                    september: raw_hdd.sep,
                    october: raw_hdd.oct,
                    november: raw_hdd.nov,
                    december: raw_hdd.dec,
                    january: raw_hdd.jan,
                    february: raw_hdd.feb,
                    march: raw_hdd.mar,
                };

                upsert_hdd(&state, &hdd).await?;
            }
        }

        _ => {
            return Err(ApiError::BadRequest(format!(
                "Unknown category: {}",
                category
            )));
        }
    }

    Ok(StatusCode::CREATED)
}

/// Fetch site_id from DB using site_name
async fn fetch_site_id_by_name(state: &Arc<AppState>, site_name: &str) -> Result<i32, ApiError> {
    let db = &state.database_connection;

    let existing_site = site::Entity::find()
        .filter(site::Column::Name.eq(site_name))
        .one(db)
        .await
        .map_err(|e| {
            ApiError::InternalServerError(format!("DB error fetching site by name: {e}"))
        })?;

    if let Some(site_model) = existing_site {
        Ok(site_model.id)
    } else {
        Err(ApiError::BadRequest(format!(
            "Site not found: {}",
            site_name
        )))
    }
}

/// Upsert a site record by UPRN
async fn upsert_site(
    state: &Arc<AppState>,
    site_info: &SiteInformation,
) -> Result<site::Model, ApiError> {
    let db = &state.database_connection;

    let uprn = match &site_info.unique_property_reference_number {
        Some(uprn) => uprn.clone(),
        None => {
            return Err(ApiError::BadRequest(
                "Missing Unique Property Reference Number (UPRN)".to_string(),
            ))
        }
    };

    let existing = site::Entity::find()
        .filter(site::Column::UniquePropertyReferenceNumber.eq(uprn.clone()))
        .one(db)
        .await
        .map_err(|e| ApiError::InternalServerError(format!("Database query failed: {}", e)))?;

    if let Some(existing_model) = existing {
        // Update existing
        let mut active_model = existing_model.into_active_model();
        active_model.name = Set(site_info.name.clone());
        active_model.floor_area_square_metre = Set(site_info.floor_area_square_metre);
        active_model.unique_property_reference_number =
            Set(site_info.unique_property_reference_number.clone());
        active_model.ni185_energy_user = Set(site_info.ni185_energy_user.clone());
        active_model.comment = Set(site_info.comment.clone());

        let updated = active_model
            .update(db)
            .await
            .map_err(|e| ApiError::InternalServerError(e.to_string()))?;

        Ok(updated)
    } else {
        // Insert new
        let new_active = site::ActiveModel {
            name: Set(site_info.name.clone()),
            floor_area_square_metre: Set(site_info.floor_area_square_metre),
            unique_property_reference_number: Set(site_info
                .unique_property_reference_number
                .clone()),
            ni185_energy_user: Set(site_info.ni185_energy_user.clone()),
            comment: Set(site_info.comment.clone()),
            ..Default::default()
        };

        let inserted = new_active
            .insert(db)
            .await
            .map_err(|e| ApiError::InternalServerError(e.to_string()))?;
        Ok(inserted)
    }
}

/// Upsert an electricity_usage_record record by (site_id, start_year)
async fn upsert_electricity_usage_record(
    state: &Arc<AppState>,
    record: &ElectricityUsageRecord,
) -> Result<electricity_usage_record::Model, ApiError> {
    let db = &state.database_connection;

    let existing = electricity_usage_record::Entity::find()
        .filter(electricity_usage_record::Column::SiteId.eq(record.site_id))
        .filter(electricity_usage_record::Column::StartYear.eq(record.start_year))
        .one(db)
        .await
        .map_err(|e| ApiError::InternalServerError(e.to_string()))?;

    if let Some(existing_model) = existing {
        // Update existing
        let mut active_model = existing_model.into_active_model();
        active_model.energy_usage_kwh = Set(record.energy_usage_kwh);
        active_model.cost_gbp = Set(record.cost_gbp);

        let updated = active_model
            .update(db)
            .await
            .map_err(|e| ApiError::InternalServerError(e.to_string()))?;
        Ok(updated)
    } else {
        // Insert new
        let new_active = electricity_usage_record::ActiveModel {
            site_id: Set(record.site_id),
            start_year: Set(record.start_year),
            energy_usage_kwh: Set(record.energy_usage_kwh),
            cost_gbp: Set(record.cost_gbp),
            ..Default::default()
        };

        let inserted = new_active
            .insert(db)
            .await
            .map_err(|e| ApiError::InternalServerError(e.to_string()))?;
        Ok(inserted)
    }
}

/// Upsert a gas_usage_record record by (site_id, start_year)
async fn upsert_gas_usage_record(
    state: &Arc<AppState>,
    record: &GasUsageRecord,
) -> Result<gas_usage_record::Model, ApiError> {
    let db = &state.database_connection;

    let existing = gas_usage_record::Entity::find()
        .filter(gas_usage_record::Column::SiteId.eq(record.site_id))
        .filter(gas_usage_record::Column::StartYear.eq(record.start_year))
        .one(db)
        .await
        .map_err(|e| ApiError::InternalServerError(e.to_string()))?;

    if let Some(existing_model) = existing {
        let mut active_model = existing_model.into_active_model();
        active_model.energy_usage_kwh = Set(record.energy_usage_kwh);
        active_model.cost_gbp = Set(record.cost_gbp);

        let updated = active_model
            .update(db)
            .await
            .map_err(|e| ApiError::InternalServerError(e.to_string()))?;
        Ok(updated)
    } else {
        // Insert new
        let new_active = gas_usage_record::ActiveModel {
            site_id: Set(record.site_id),
            start_year: Set(record.start_year),
            energy_usage_kwh: Set(record.energy_usage_kwh),
            cost_gbp: Set(record.cost_gbp),
            ..Default::default()
        };

        let inserted = new_active
            .insert(db)
            .await
            .map_err(|e| ApiError::InternalServerError(e.to_string()))?;
        Ok(inserted)
    }
}

/// Upsert a heating_degree_day record by start_year
async fn upsert_hdd(
    state: &Arc<AppState>,
    hdd: &HeatingDegreeDay,
) -> Result<heating_degree_day::Model, ApiError> {
    let db = &state.database_connection;

    // Attempt to find an existing row with the same start_year
    let existing = heating_degree_day::Entity::find()
        .filter(heating_degree_day::Column::StartYear.eq(hdd.start_year))
        .one(db)
        .await
        .map_err(|e| ApiError::InternalServerError(format!("Failed to fetch HDD: {e}")))?;

    if let Some(existing_model) = existing {
        // Update existing record
        let mut active_model = existing_model.into_active_model();
        active_model.april = Set(hdd.april);
        active_model.may = Set(hdd.may);
        active_model.june = Set(hdd.june);
        active_model.july = Set(hdd.july);
        active_model.august = Set(hdd.august);
        active_model.september = Set(hdd.september);
        active_model.october = Set(hdd.october);
        active_model.november = Set(hdd.november);
        active_model.december = Set(hdd.december);
        active_model.january = Set(hdd.january);
        active_model.february = Set(hdd.february);
        active_model.march = Set(hdd.march);

        let updated = active_model
            .update(db)
            .await
            .map_err(|e| ApiError::InternalServerError(format!("Failed to update HDD: {e}")))?;
        Ok(updated)
    } else {
        // Insert new
        let new_active = heating_degree_day::ActiveModel {
            start_year: Set(hdd.start_year),
            april: Set(hdd.april),
            may: Set(hdd.may),
            june: Set(hdd.june),
            july: Set(hdd.july),
            august: Set(hdd.august),
            september: Set(hdd.september),
            october: Set(hdd.october),
            november: Set(hdd.november),
            december: Set(hdd.december),
            january: Set(hdd.january),
            february: Set(hdd.february),
            march: Set(hdd.march),
            ..Default::default() // Let DB compute end_year and total
        };

        let inserted = new_active
            .insert(db)
            .await
            .map_err(|e| ApiError::InternalServerError(format!("Failed to insert HDD: {e}")))?;
        Ok(inserted)
    }
}
