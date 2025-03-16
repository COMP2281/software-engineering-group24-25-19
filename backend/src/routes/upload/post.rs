use axum::{
    extract::{Multipart, State},
    http::StatusCode,
};
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{str, sync::Arc};

use crate::{api_error::ApiError, app_state::AppState, entities::site};

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

/// This expects a `multipart/form-data` with fields:
/// - `"category"` : `"site-information"`
/// - `"start_year"`: integer (can be set to anything for site-information)
/// - `"data"`: JSON payload (array of records)
pub async fn handler(
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> Result<StatusCode, ApiError> {
    let mut category: Option<String> = None;
    let mut _start_year: Option<i32> = None;
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
                _start_year =
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
    let _start_year =
        _start_year.ok_or_else(|| ApiError::BadRequest("Missing field: 'start_year'".into()))?;
    let data_json =
        data_json.ok_or_else(|| ApiError::BadRequest("Missing field: 'data'".into()))?;

    match category.as_str() {
        "site-information" => {
            let sites: Vec<SiteInformation> = serde_json::from_value(data_json).map_err(|e| {
                ApiError::BadRequest(format!("Failed to parse SiteInformation array: {e}"))
            })?;

            for site_info in sites {
                upsert_site(&state, &site_info).await?;
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

/// Upsert a site record by UPRN/code
///
/// If an entry with the same UPRN exists, update it
/// If not, insert new row
async fn upsert_site(
    state: &Arc<AppState>,
    site_info: &SiteInformation,
) -> Result<site::Model, ApiError> {
    let db = &state.database_connection;

    // Ensure we have a valid UPRN
    let uprn = match &site_info.unique_property_reference_number {
        Some(code) => code.clone(),
        None => {
            return Err(ApiError::BadRequest(
                "Missing Unique Property Reference Number (UPRN)".to_string(),
            ))
        }
    };

    // Check if a record exists using the UPRN
    let existing = site::Entity::find()
        .filter(site::Column::UniquePropertyReferenceNumber.eq(uprn.clone()))
        .one(db)
        .await
        .map_err(|e| ApiError::InternalServerError(format!("Database query failed: {}", e)))?;

    if let Some(existing_model) = existing {
        // Update existing record
        let mut active_model = existing_model.into_active_model();

        active_model.name = Set(site_info.name.clone());
        active_model.floor_area_square_metre = Set(site_info.floor_area_square_metre);
        active_model.ni185_energy_user = Set(site_info.ni185_energy_user.clone());
        active_model.comment = Set(site_info.comment.clone());

        let updated = active_model
            .update(db)
            .await
            .map_err(|e| ApiError::InternalServerError(format!("Failed to update site: {}", e)))?;
        Ok(updated)
    } else {
        // Insert new record
        let new_active = site::ActiveModel {
            name: Set(site_info.name.clone()),
            floor_area_square_metre: Set(site_info.floor_area_square_metre),
            unique_property_reference_number: Set(Some(uprn)), // Ensure UPRN is set
            ni185_energy_user: Set(site_info.ni185_energy_user.clone()),
            comment: Set(site_info.comment.clone()),
            ..Default::default() // Fill in other required columns
        };

        let inserted = new_active
            .insert(db)
            .await
            .map_err(|e| ApiError::InternalServerError(format!("Failed to insert site: {}", e)))?;
        Ok(inserted)
    }
}
