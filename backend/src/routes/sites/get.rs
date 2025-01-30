use crate::{
    entities::site,
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
    names: Option<Vec<String>>,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<Params>,
) -> Result<Json<Vec<site::Model>>, ApiError> {
    debug!("params.names={:?}", params.names);

    let conditions =
        Condition::all().add_option(params.names.map(|names| site::Column::Name.is_in(names)));

    let matched_records: Vec<site::Model> = site::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;

    Ok(Json(matched_records))
}
