use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    // custom_extractors module contains the custom extractors for the API handlers
    // Json and Query are custom extractors for extracting JSON payloads and query parameters
    entities::heating_degree_day,
        // entities (heating_degree_day) is a module that contains the definitions of the entities in the database
};
use axum::{extract::State, http::StatusCode};
// axum is a web framework based on hyper, the Rust HTTP library
// extract::State is used to extract the application state from the request
// http::StatusCode is an enum representing HTTP status codes
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
// sea_orm is an async & dynamic ORM. It provides a high-level and friendly API for interacting with databases
// ColumnTrait and EntityTrait are traits that provide methods for working with columns and entities
// QueryFilter is a trait that provides methods for filtering query results
use serde::Deserialize;
// serde is a framework for serializing and deserializing Rust data structures
// Deserialize is a trait that allows data structures to be deserialized from a string
use std::sync::Arc;
// std::sync is a module that provides synchronization primitives for concurrent programming
// Arc is a thread-safe reference-counted pointer
use tracing::debug;

// tracing is a framework for instrumenting Rust programs with context-aware, structured, event-based diagnostic information
// debug! is a macro used to log debug messages
#[derive(Debug, Default, Deserialize)]
// QueryParams is a struct that represents the query parameters for the GET /heating_degree_days endpoint
pub(super) struct QueryParams {
    start_years: Option<Vec<i32>>,
    min_total: Option<i32>,
    max_total: Option<i32>,
    // start_years is an optional vector of integers representing the start years of the heating degree days
    // min_total is an optional integer representing the minimum total heating degree days
    // max_total is an optional integer representing the maximum total heating degree days
}
// handler is an async function that handles GET requests to the /heating_degree_days endpoint
pub(super) async fn handler(
    // takes the application state, query parameters, and returns a result containing the HTTP status code and JSON response
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<heating_degree_day::Model>>), ApiError> {
    debug!("query_params = {:?}", query_params);

    // Construct the conditions based on the query parameters
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
    // search for heating degree days that match the query parameters
    let matched_records: Vec<heating_degree_day::Model> = heating_degree_day::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;
    // return the matched records as a JSON response with an HTTP status code of 200 OK
    Ok((StatusCode::OK, Json(matched_records)))
}
