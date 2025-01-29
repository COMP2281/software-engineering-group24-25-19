use crate::entities::site;
use crate::structs::{ApiError, AppState};
use axum::{extract::State, routing::get, Json, Router};
use axum_extra::extract::Query;
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

#[derive(Deserialize)]
struct Params {
    #[serde(default)]
    names: Vec<String>,
}

async fn handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<Params>,
) -> Result<Json<Vec<site::Model>>, ApiError> {
    debug!("params.names={:?}", params.names);

    let conditions = Condition::all().add_option(match params.names.is_empty() {
        true => None,
        false => Some(site::Column::Name.is_in(params.names)),
    });

    let matched_records: Vec<site::Model> = site::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;

    Ok(Json(matched_records))
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(handler))
}
