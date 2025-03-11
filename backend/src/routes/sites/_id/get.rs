use super::path_params::PathParams;
use crate::{api_error::ApiError, app_state::AppState, custom_extractors::Path, entities::site};
use axum::{extract::State, http::StatusCode, Json};
use sea_orm::{DbErr, EntityTrait as _};
use std::sync::Arc;
use tracing::debug;

/// Handles GET requests for a specific site
///
/// Retrieves the site with the ID specified in the path parameters
pub(super) async fn handler(
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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::response::IntoResponse;
    use sea_orm::{DatabaseBackend, MockDatabase};

    /// Tests retrieval of an existing site record
    #[tokio::test]
    async fn test_existing_record() {
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
        let query = Path(PathParams { id: 1 });

        let response = handler(state, query)
            .await
            .expect("handler should not fail with existing record")
            .into_response();
        assert_eq!(StatusCode::OK, response.status());
    }

    /// Tests retrieval of a non-existing site record
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

        let response = handler(state, query)
            .await
            .expect_err("handler should fail with non existing record")
            .into_response();

        assert_eq!(StatusCode::NOT_FOUND, response.status());
    }
}
