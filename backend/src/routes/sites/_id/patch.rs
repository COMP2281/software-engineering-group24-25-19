use super::path_params::PathParams;
use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Path},
    entities::site,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{
    ActiveModelTrait as _,
    ActiveValue::{NotSet, Set},
    DbErr, EntityTrait as _,
};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

#[derive(Debug, Deserialize)]
pub(super) struct Payload {
    pub name: Option<String>,
    pub floor_area_square_metre: Option<f64>,
    pub unique_property_reference_number: Option<String>,
    pub ni185_energy_user: Option<String>,
    pub comment: Option<String>,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Path(path_params): Path<PathParams>,
    Json(payload): Json<Payload>,
) -> Result<(StatusCode, Json<site::Model>), ApiError> {
    debug!("path_params = {:?}", path_params);
    debug!("payload = {:?}", payload);

    let mut matched_record: site::ActiveModel = site::Entity::find_by_id(path_params.id)
        .one(&state.database_connection)
        .await?
        .ok_or(DbErr::RecordNotFound(format!(
            "`site` entity with id `{}` not found",
            path_params.id
        )))?
        .into();

    matched_record.name = match payload.name {
        Some(name) => Set(name),
        None => NotSet,
    };

    matched_record.floor_area_square_metre = match payload.floor_area_square_metre {
        Some(floor_area_square_metre) => Set(Some(floor_area_square_metre)),
        None => NotSet,
    };

    matched_record.unique_property_reference_number = match payload.unique_property_reference_number
    {
        Some(uprn) => Set(Some(uprn)),
        None => NotSet,
    };

    matched_record.ni185_energy_user = match payload.ni185_energy_user {
        Some(energy_user) => Set(Some(energy_user)),
        None => NotSet,
    };

    matched_record.comment = match payload.comment {
        Some(comment) => Set(Some(comment)),
        None => NotSet,
    };

    let matched_record = matched_record.update(&state.database_connection).await?;

    Ok((StatusCode::OK, Json(matched_record)))
}
