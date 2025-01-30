use crate::{
    entities::site,
    structs::{ApiError, AppState},
};
use axum::{extract::State, Json};
use sea_orm::{ActiveModelTrait as _, ActiveValue::Set};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

#[derive(Debug, Deserialize)]
pub(super) struct Payload {
    pub name: String,
    pub floor_area_square_metre: Option<f64>,
    pub unique_property_reference_number: Option<String>,
    pub ni185_energy_user: Option<String>,
    pub comment: Option<String>,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Payload>,
) -> Result<(), ApiError> {
    debug!("payload = {:?}", payload);

    let new_site = site::ActiveModel {
        name: Set(payload.name),
        floor_area_square_metre: Set(payload.floor_area_square_metre),
        unique_property_reference_number: Set(payload.unique_property_reference_number),
        ni185_energy_user: Set(payload.ni185_energy_user),
        comment: Set(payload.comment),
        ..Default::default()
    };

    new_site.insert(&state.database_connection).await?;

    Ok(())
}
