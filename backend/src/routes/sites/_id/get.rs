use super::path_params::PathParams;
use crate::{
    entities::site,
    structs::{ApiError, AppState},
};
use axum::{
    extract::{Path, State},
    Json,
};
use sea_orm::EntityTrait as _;
use std::sync::Arc;
use tracing::debug;

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Path(path_params): Path<PathParams>,
) -> Result<Json<site::Model>, ApiError> {
    debug!("path_params = {:?}", path_params);

    let matched_record = site::Entity::find_by_id(path_params.id)
        .one(&state.database_connection)
        .await?
        // TODO: error handling for no matching record
        .unwrap();

    Ok(Json(matched_record))
}
