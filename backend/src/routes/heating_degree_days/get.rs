use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    entities::heating_degree_day,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

/// Query parameters for filtering heating degree days
#[derive(Debug, Default, Deserialize)]
pub(super) struct QueryParams {
    start_years: Option<Vec<i32>>,
    min_total: Option<i32>,
    max_total: Option<i32>,
}

/// Handles GET requests for heating degree days
///
/// Filters records based on optional query parameters
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<heating_degree_day::Model>>), ApiError> {
    debug!("query_params = {:?}", query_params);

    // Build the conditions based on the query parameters.
    let conditions = Condition::all()
        .add_option(
            query_params
                .start_years
                .map(|start_years| heating_degree_day::Column::StartYear.is_in(start_years)),
        )
        .add_option(
            query_params
                .min_total
                .map(|min_total| heating_degree_day::Column::Total.gte(min_total)),
        )
        .add_option(
            query_params
                .max_total
                .map(|max_total| heating_degree_day::Column::Total.lte(max_total)),
        );

    // Find the heating degree day records that match the conditions.
    let matched_records: Vec<heating_degree_day::Model> = heating_degree_day::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;

    // Return the matched records as a JSON response.
    Ok((StatusCode::OK, Json(matched_records)))
}
