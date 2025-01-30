use super::path_params::PathParams;
use crate::{
    entities::site,
    structs::{ApiError, AppState},
};
use axum::extract::{Path, State};
use sea_orm::EntityTrait as _;
use std::sync::Arc;
use tracing::debug;

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Path(path_params): Path<PathParams>,
) -> Result<(), ApiError> {
    debug!("path_params = {:?}", path_params);

    site::Entity::delete_by_id(path_params.id)
        .exec(&state.database_connection)
        .await?;

    Ok(())
}
