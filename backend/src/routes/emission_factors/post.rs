use crate::{
    api_error::ApiError, app_state::AppState, custom_extractors::Json, entities::emission_factor,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{
    ActiveModelTrait as _, ActiveValue::NotSet, ActiveValue::Set, ColumnTrait, EntityTrait,
    IntoActiveModel, QueryFilter,
};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

/// Payload for creating a new emission factor record
///
/// All fields are required
#[derive(Debug, Default, Deserialize)]
pub(super) struct Payload {
    pub start_year: i32,
    pub gas: Option<f64>,
    pub electricity: Option<f64>,
}

/// Handles POST requests to create a new site
///
/// Creates a site with the provided data and returns the created site
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Payload>,
) -> Result<(StatusCode, Json<emission_factor::Model>), ApiError> {
    debug!("payload = {:?}", payload);

    let db = &state.database_connection;

    let gas = payload.gas.unwrap_or(0.0);
    let electricity = payload.electricity.unwrap_or(0.0);

    // Try to find an existing emission factor with given start_year
    if let Some(existing_emission_factor) = emission_factor::Entity::find()
        .filter(emission_factor::Column::StartYear.eq(payload.start_year))
        .one(db)
        .await?
    {
        // Update the existing record
        let mut active_model = existing_emission_factor.into_active_model();
        active_model.gas = Set(gas);
        active_model.electricity = Set(electricity);

        let updated_model = active_model.update(db).await?;
        Ok((StatusCode::OK, Json(updated_model)))
    } else {
        // Create a new record
        let emission_factor_model = emission_factor::ActiveModel {
            start_year: Set(payload.start_year),
            end_year: NotSet,
            gas: Set(gas),
            electricity: Set(electricity),
        };

        let new_model = emission_factor_model.insert(db).await?;
        Ok((StatusCode::CREATED, Json(new_model)))
    }
}
