use crate::entities::emission_factor;
use crate::structs::{ApiError, AppState};
use axum::{extract::State, routing::get, Json, Router};
use axum_extra::extract::Query;
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

#[derive(Deserialize)]
struct EmissionFactorsParams {
    #[serde(default)]
    start_years: Vec<i32>,
}

async fn emission_factors(
    State(state): State<Arc<AppState>>,
    Query(params): Query<EmissionFactorsParams>,
) -> Result<Json<Vec<emission_factor::Model>>, ApiError> {
    debug!("params.names={:?}", params.start_years);

    let conditions = Condition::all().add_option(match params.start_years.is_empty() {
        true => None,
        false => Some(emission_factor::Column::StartYear.is_in(params.start_years)),
    });

    let matched_records: Vec<emission_factor::Model> = emission_factor::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;

    Ok(Json(matched_records))
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(emission_factors))
}
