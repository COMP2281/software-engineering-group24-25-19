use crate::{
    api_error::ApiError, app_state::AppState, custom_extractors::Json, entities::emission_factor,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ActiveModelTrait as _, ActiveValue::NotSet, ActiveValue::Set};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

/// Payload for creating a new emission factor record
///
/// All fields are required
#[derive(Debug, Default, Deserialize)]
pub(super) struct Payload {
    pub start_year: i32,
    pub gas: f64,
    pub electricity: f64,
}

/// Handles POST requests to create a new site
///
/// Creates a site with the provided data and returns the created site
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Payload>,
) -> Result<(StatusCode, Json<emission_factor::Model>), ApiError> {
    debug!("payload = {:?}", payload);

    // Build new emission factor entry based on the query parameters.
    let new_emission_factor = emission_factor::ActiveModel {
        start_year: Set(payload.start_year),
        end_year: NotSet,
        gas: Set(payload.gas),
        electricity: Set(payload.electricity),
    };

    // Inser the new emission factor entry into the database
    let new_emission_factor = new_emission_factor
        .insert(&state.database_connection)
        .await?;

    // Return the created record as a JSON response.
    Ok((StatusCode::CREATED, Json(new_emission_factor)))
}
