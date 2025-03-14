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

/// Payload for updating site properties
///
/// All fields are optional, allowing partial updates
#[derive(Debug, Default, Deserialize)]
pub(super) struct Payload {
    pub name: Option<String>,
    pub floor_area_square_metre: Option<f64>,
    pub unique_property_reference_number: Option<String>,
    pub ni185_energy_user: Option<String>,
    pub comment: Option<String>,
}

/// Handles PATCH requests for a specific site
///
/// Updates site properties based on the provided payload
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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::response::IntoResponse;
    use sea_orm::{DatabaseBackend, MockDatabase, MockExecResult};

    /// Tests updating an existing site record
    #[tokio::test]
    async fn test_existing_record() {
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_query_results(vec![
                vec![site::Model {
                    id: 1,
                    name: "Site A".to_owned(),
                    ..Default::default()
                }],
                vec![site::Model {
                    id: 1,
                    name: "Site A".to_owned(),
                    comment: Some("To be refurbished".to_owned()),
                    ..Default::default()
                }],
            ])
            .append_exec_results(vec![MockExecResult::default()])
            .into_connection();

        let state = State(Arc::new(AppState {
            database_connection,
        }));
        let query = Path(PathParams { id: 1 });
        let json = Json(Payload {
            comment: Some("To be refurbished".to_owned()),
            ..Default::default()
        });

        let response = handler(state, query, json)
            .await
            .expect("handler should not fail with existing record")
            .into_response();
        assert_eq!(StatusCode::OK, response.status());
    }

    /// Tests updating a non-existing site record
    ///
    /// Verifies that a 404 NOT_FOUND status is returned
    #[tokio::test]
    async fn test_non_existing_record() {
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_query_errors(vec![DbErr::RecordNotFound(
                "`site` entity with id `404` not found".to_owned(),
            )])
            .into_connection();

        let state = State(Arc::new(AppState {
            database_connection,
        }));
        let query = Path(PathParams { id: 404 });
        let json = Json(Payload::default());

        let response = handler(state, query, json)
            .await
            .expect_err("handler should fail with non existing record")
            .into_response();

        assert_eq!(StatusCode::NOT_FOUND, response.status());
    }
}
