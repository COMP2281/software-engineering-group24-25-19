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

#[derive(Debug, Deserialize)]
pub(super) struct QueryParams {
    site_ids: Option<Vec<i32>>,
    start_years: Option<Vec<i32>>,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<gas_usage_record::Model>>), ApiError> {
    debug!("query_params = {:?}", query_params);

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

    let matched_records: Vec<gas_usage_record::Model> = gas_usage_record::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;

    Ok((StatusCode::OK, Json(matched_records)))
}
