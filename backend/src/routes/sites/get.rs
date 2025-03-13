use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    entities::site,
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait as _, Condition, EntityTrait as _, QueryFilter as _};
use serde::Deserialize;
use std::{collections::HashSet, sync::Arc};
use tracing::debug;

/// Query parameters for filtering sites
#[derive(Debug, Default, Deserialize)]
pub(super) struct QueryParams {
    ids: Option<HashSet<i32>>,
    name: Option<String>,
    floor_area_square_metre_min: Option<f64>,
    floor_area_square_metre_max: Option<f64>,
    unique_property_reference_number: Option<String>,
    ni185_energy_user: Option<String>,
}

/// Handles GET requests for sites
///
/// Filters sites based on optional query parameters
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<site::Model>>), ApiError> {
    debug!("query_params = {:?}", query_params);

    // Build the conditions based on the query parameters.
    let conditions = Condition::all()
        .add_option(query_params.ids.map(|ids| site::Column::Id.is_in(ids)))
        .add_option(
            query_params
                .name
                .map(|search| site::Column::Name.contains(search)),
        )
        .add_option(
            query_params
                .floor_area_square_metre_min
                .map(|min| site::Column::FloorAreaSquareMetre.gte(min)),
        )
        .add_option(
            query_params
                .floor_area_square_metre_max
                .map(|max| site::Column::FloorAreaSquareMetre.lte(max)),
        )
        .add_option(
            query_params
                .unique_property_reference_number
                .map(|search| site::Column::UniquePropertyReferenceNumber.contains(search)),
        )
        .add_option(
            query_params
                .ni185_energy_user
                .map(|search| site::Column::Ni185EnergyUser.contains(search)),
        );

    // Find the site records that match the conditions.
    let matched_records: Vec<site::Model> = site::Entity::find()
        .filter(conditions)
        .all(&state.database_connection)
        .await?;

    // Return the matched records as a JSON response.
    Ok((StatusCode::OK, Json(matched_records)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::response::IntoResponse;
    use sea_orm::{DatabaseBackend, MockDatabase};

    /// Tests the handler without any query parameters
    #[tokio::test]
    async fn test_without_query_parameters() {
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_query_results(vec![vec![site::Model {
                id: 1,
                name: "Site A".to_owned(),
                ..Default::default()
            }]])
            .into_connection();

        let state = State(Arc::new(AppState {
            database_connection,
        }));
        let query = Query(QueryParams::default());

        let response = handler(state, query)
            .await
            .expect("handler should not fail with no query parameters")
            .into_response();
        assert_eq!(StatusCode::OK, response.status());
    }

    /// Tests the handler with all query parameters provided
    #[tokio::test]
    async fn test_with_query_parameters() {
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_query_results(vec![vec![site::Model {
                id: 1,
                name: "Site A".to_owned(),
                floor_area_square_metre: Some(75.0),
                unique_property_reference_number: Some("ABC123".to_owned()),
                ni185_energy_user: Some("User A".to_owned()),
                comment: Some("To be refurbished".to_owned()),
            }]])
            .into_connection();

        let state = State(Arc::new(AppState {
            database_connection,
        }));
        let query = Query(QueryParams {
            ids: Some(vec![1, 2, 3]),
            name: Some("A".to_owned()),
            floor_area_square_metre_min: Some(50.0),
            floor_area_square_metre_max: Some(100.0),
            unique_property_reference_number: Some("ABC".to_owned()),
            ni185_energy_user: Some("User A".to_owned()),
        });

        let response = handler(state, query)
            .await
            .expect("handler should not fail with query parameters")
            .into_response();

        assert_eq!(StatusCode::OK, response.status());
    }
}
