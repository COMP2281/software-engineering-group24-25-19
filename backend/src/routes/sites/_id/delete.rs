use super::path_params::PathParams;
use crate::{api_error::ApiError, app_state::AppState, custom_extractors::Path, entities::site};
use axum::{extract::State, http::StatusCode};
use sea_orm::EntityTrait as _;
use std::sync::Arc;
use tracing::debug;

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Path(path_params): Path<PathParams>,
) -> Result<StatusCode, ApiError> {
    debug!("path_params = {:?}", path_params);

    site::Entity::delete_by_id(path_params.id)
        .exec(&state.database_connection)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
