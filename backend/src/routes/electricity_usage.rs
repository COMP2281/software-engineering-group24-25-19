use crate::entities::electricity_usage_record;
use crate::structs::{ApiError, AppState};
use axum::{extract::State, routing::get, Json, Router};
use axum_extra::extract::Query;
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

#[derive(Deserialize)]
struct ElectricityUsageParams {
    #[serde(default)]
    site_ids: Vec<i32>,
    #[serde(default)]
    start_years: Vec<i32>,
}

async fn electricity_usage(
    State(state): State<Arc<AppState>>,
    Query(params): Query<ElectricityUsageParams>,
) -> Result<Json<Vec<electricity_usage_record::Model>>, ApiError> {
    debug!(
        "params.site_ids={:?}, start_years={:?}",
        params.site_ids, params.start_years
    );

    let conditions = Condition::all()
        .add_option(match params.site_ids.is_empty() {
            true => None,
            false => Some(electricity_usage_record::Column::SiteId.is_in(params.site_ids)),
        })
        .add_option(match params.start_years.is_empty() {
            true => None,
            false => Some(electricity_usage_record::Column::StartYear.is_in(params.start_years)),
        });

    let matched_records: Vec<electricity_usage_record::Model> =
        electricity_usage_record::Entity::find()
            .filter(conditions)
            .all(&state.database_connection)
            .await?;

    Ok(Json(matched_records))
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(electricity_usage))
}
