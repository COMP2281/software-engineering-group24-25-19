use super::path_params::PathParams;
use crate::{api_error::ApiError, app_state::AppState, custom_extractors::Path, entities::site};
use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{DbErr, EntityTrait as _};
use std::sync::Arc;
use tracing::debug;

pub async fn handler(
    State(state): State<Arc<AppState>>,
    Path(path_params): Path<PathParams>,
) -> Result<(StatusCode, Json<site::Model>), ApiError> {
    debug!("path_params = {:?}", path_params);

    let matched_record = site::Entity::find_by_id(path_params.id)
        .one(&state.database_connection)
        .await?
        .ok_or(DbErr::RecordNotFound(format!(
            "`site` entity with id `{}` not found",
            path_params.id
        )))?;

    Ok((StatusCode::OK, Json(matched_record)))
}
