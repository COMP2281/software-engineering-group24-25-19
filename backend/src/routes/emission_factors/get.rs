use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    entities::emission_factor,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::{collections::HashSet, sync::Arc};
use tracing::debug;

/// Query parameters for filtering emission factors
#[derive(Debug, Deserialize)]
pub(super) struct QueryParams {
    start_years: Option<HashSet<i32>>,
}

/// Handles GET requests for emission factors
///
/// Filters emission factors based on optional query parameters
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<emission_factor::Model>>), ApiError> {
    debug!("query_params={:?}", query_params);

    let conditions = Condition::all().add_option(
        query_params
            .start_years
            .map(|start_years| emission_factor::Column::StartYear.is_in(start_years)),
    );

    let matched_records: Vec<emission_factor::Model> = emission_factor::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;

    Ok((StatusCode::OK, Json(matched_records)))
}
