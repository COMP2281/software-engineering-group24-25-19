use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    entities::electricity_usage_record,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::{collections::HashSet, sync::Arc};
use tracing::debug;

/// Query parameters for filtering electricity usage records
#[derive(Deserialize, Debug)]
pub(super) struct QueryParams {
    site_ids: Option<HashSet<i32>>,
    start_years: Option<HashSet<i32>>,
}

/// Handles GET requests for electricity usage records
///
/// Filters records based on optional query parameters
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<electricity_usage_record::Model>>), ApiError> {
    debug!("query_params = {:?}", query_params);

    // Build the conditions based on the query parameters.
    let conditions = Condition::all()
        .add_option(
            query_params
                .site_ids
                .map(|site_ids| electricity_usage_record::Column::SiteId.is_in(site_ids)),
        )
        .add_option(
            query_params
                .start_years
                .map(|start_years| electricity_usage_record::Column::StartYear.is_in(start_years)),
        );

    // Find the electricity usage records that match the conditions.
    let matched_records: Vec<electricity_usage_record::Model> =
        electricity_usage_record::Entity::find()
            .filter(conditions)
            .all(&state.database_connection)
            .await?;

    // Return the matched records as a JSON response.
    Ok((StatusCode::OK, Json(matched_records)))
}
