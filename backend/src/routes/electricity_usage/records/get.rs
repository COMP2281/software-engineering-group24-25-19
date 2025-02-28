use crate::{
    api_error::ApiError,     // importing error type
    app_state::AppState,    // importing appstate
    custom_extractors::{Json, Query}, // importing customer extractor for JSON and Query parameters
    entities::electricity_usage_record, // importing electricity_usage_record entity
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
// importing sea_orm traits and types, for database operations
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

#[derive(Deserialize, Debug)]
// struct that holds query parameters for filtering electricity usage report

pub(super) struct QueryParams {
    site_ids: Option<Vec<i32>>,
    // optional list of sites IDs to filer by, optional as in can be empty
    // i32 for 32-bit integer
    start_years: Option<Vec<i32>>,
    // optional start_years in 32-bit integer

}
// handler function to process the GET request for electricity usage records
// it takes the app state and query parameters as input
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,

    // the handler function returns a Result containing a tuple of status code and JSON
    // the JSON contains a vector of electricity usage records
    // the function can also return an error of type ApiError
) -> Result<(StatusCode, Json<Vec<electricity_usage_record::Model>>), ApiError> {
    debug!("query_params = {:?}", query_params);


    // building a condition to filter the electricity usage records
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


    // executing query base to the given conditions 
    let matched_records: Vec<electricity_usage_record::Model> =
        electricity_usage_record::Entity::find()
            .filter(conditions)
            .all(&state.database_connection)
            .await?;

    Ok((StatusCode::OK, Json(matched_records)))
    // returning the matching records with a ok(200) status

}
