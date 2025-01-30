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

#[derive(Debug, Deserialize)]
pub(super) struct Params {
    ids: Option<Vec<i32>>,
    name: Option<String>,
    floor_area_square_metre_min: Option<f64>,
    floor_area_square_metre_max: Option<f64>,
    unique_property_reference_number: Option<String>,
    ni185_energy_user: Option<String>,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<Params>,
) -> Result<Json<Vec<site::Model>>, ApiError> {
    debug!("params = {:?}", params);

    let conditions = Condition::all()
        .add_option(params.ids.map(|ids| site::Column::Id.is_in(ids)))
        .add_option(
            params
                .name
                .map(|search| site::Column::Name.contains(search)),
        )
        .add_option(
            params
                .floor_area_square_metre_min
                .map(|min| site::Column::FloorAreaSquareMetre.gte(min)),
        )
        .add_option(
            params
                .floor_area_square_metre_max
                .map(|max| site::Column::FloorAreaSquareMetre.lte(max)),
        )
        .add_option(
            params
                .unique_property_reference_number
                .map(|search| site::Column::UniquePropertyReferenceNumber.contains(search)),
        )
        .add_option(
            params
                .ni185_energy_user
                .map(|search| site::Column::Ni185EnergyUser.contains(search)),
        );

    let matched_records: Vec<site::Model> = site::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;

    Ok(Json(matched_records))
}
