use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    entities::gas_usage_record,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

// Define a struct that represents the query parameters
// site_ids in 32-bit integer format
// start_years in 32-bit integer format
// optional fields apply to the query parameters
#[derive(Debug, Deserialize)]
pub(super) struct QueryParams {
    site_ids: Option<Vec<i32>>,
    start_years: Option<Vec<i32>>,
}

// handler function for the endpoint
pub(super) async fn handler(
    // state: application state
    State(state): State<Arc<AppState>>,
    // query_params: query parameters
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<gas_usage_record::Model>>), ApiError> {
    debug!("query_params = {:?}", query_params);
    // log the query parameters
    // build the query conditions based on the query parameters
    let conditions = Condition::all()
        .add_option(
            query_params
                .site_ids
                .map(|site_ids| gas_usage_record::Column::SiteId.is_in(site_ids)),
        )
        .add_option(
            query_params
                .start_years
                .map(|start_years| gas_usage_record::Column::StartYear.is_in(start_years)),
        );
    //execute the query to find all gas usage records that match the conditions
    let matched_records: Vec<gas_usage_record::Model> = gas_usage_record::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;
    // return the matched records as a JSON response
    Ok((StatusCode::OK, Json(matched_records)))
}
