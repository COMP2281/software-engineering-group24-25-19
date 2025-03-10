use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    entities::emission_factor,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

// Define a struct that represents the query parameters
// start_years in 32-bit integer format

#[derive(Debug, Deserialize)]
pub(super) struct QueryParams {
    start_years: Option<Vec<i32>>,
}

// Define a handler function for the endpoint
pub(super) async fn handler(
    // Extract the application state
    State(state): State<Arc<AppState>>,
    // Extract query parameters
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<emission_factor::Model>>), ApiError> {
    debug!("query_params={:?}", query_params);
    // Log the query parameters
    // Build the query conditions based on the query parameters

    let conditions = Condition::all().add_option(
        query_params
            .start_years
            .map(|start_years| emission_factor::Column::StartYear.is_in(start_years)),
    );
    // Execute the query to find all emission factor records that match the conditions
    let matched_records: Vec<emission_factor::Model> = emission_factor::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;
    // Return the matched records as a JSON response
    Ok((StatusCode::OK, Json(matched_records)))
}
