use axum::{
    extract::{Multipart, State},
    http::StatusCode,
};
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::HashSet, str, sync::Arc};

use crate::{
    api_error::ApiError,
    app_state::AppState,
    entities::{electricity_usage_record, gas_usage_record, site},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct SiteInformation {
    #[serde(rename = "site_name")]
    pub name: String,

    #[serde(rename = "floor_area_sq_mtrs")]
    pub floor_area_square_metre: Option<f64>,

    #[serde(rename = "code")]
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

/// This expects a `multipart/form-data` with fields:
/// - "category" : one of ["site-information", "electricity", "gas"]
/// - "start_year": integer
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
            let sites: Vec<SiteInformation> = serde_json::from_value(data_json).map_err(|e| {
                ApiError::BadRequest(format!("Failed to parse SiteInformation array: {e}"))
            })?;

            // Track which site names we've processed
            let mut seen_sites = HashSet::new();

            for site_info in sites {
                // If we've already seen this site name, skip it
                if !seen_sites.insert(site_info.name.clone()) {
                    // skip duplicates
                    continue;
                }
                upsert_site(&state, &site_info).await?;
            }
        }

        "electricity" => {
            let raw_records: Vec<ElectricityUsageRecordRaw> = serde_json::from_value(data_json)
                .map_err(|e| {
                    ApiError::BadRequest(format!("Failed to parse electricity array: {e}"))
                })?;

            // Track which site names we've processed
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

            // Track which site names we've processed
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

        _ => {
            return Err(ApiError::BadRequest(format!(
                "Unknown category: {}",
                category
            )))
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

/// Upsert a site record by name.
///
/// If an entry with the same name already exists, update.
/// Otherwise, insert new row.
async fn upsert_site(
    state: &Arc<AppState>,
    site_info: &SiteInformation,
) -> Result<site::Model, ApiError> {
    let db = &state.database_connection;

    let uprn = match &site_info.unique_property_reference_number {
        Some(code) => code.clone(),
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

/// Upsert an electricity_usage_record record by (site_id, start_year).
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
        // Update
        let mut active_model = existing_model.into_active_model();
        active_model.energy_usage_kwh = Set(record.energy_usage_kwh);
        active_model.cost_gbp = Set(record.cost_gbp);

        let updated = active_model
            .update(db)
            .await
            .map_err(|e| ApiError::InternalServerError(e.to_string()))?;
        Ok(updated)
    } else {
        // Insert
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

/// Upsert a gas_usage_record record by (site_id, start_year).
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
        // Insert
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
