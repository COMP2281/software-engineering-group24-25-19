use crate::{
    entities::electricity_usage_record,
    structs::{ApiError, AppState},
};
use axum::{extract::State, Json};
use axum_extra::extract::Query;
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

#[derive(Deserialize)]
pub(super) struct Params {
    site_ids: Option<Vec<i32>>,
    start_years: Option<Vec<i32>>,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<Params>,
) -> Result<Json<Vec<electricity_usage_record::Model>>, ApiError> {
    debug!(
        "params.site_ids={:?}, start_years={:?}",
        params.site_ids, params.start_years
    );

    let conditions = Condition::all()
        .add_option(
            params
                .site_ids
                .map(|site_ids| electricity_usage_record::Column::SiteId.is_in(site_ids)),
        )
        .add_option(
            params
                .start_years
                .map(|start_years| electricity_usage_record::Column::StartYear.is_in(start_years)),
        );

    let matched_records: Vec<electricity_usage_record::Model> =
        electricity_usage_record::Entity::find()
            .filter(conditions)
            .all(&state.database_connection)
            .await?;

    Ok(Json(matched_records))
}
