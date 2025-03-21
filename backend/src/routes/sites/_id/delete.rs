use super::path_params::PathParams;
use crate::{api_error::ApiError, app_state::AppState, custom_extractors::Path, entities::site};
use axum::{extract::State, http::StatusCode};
use sea_orm::EntityTrait as _;
use std::sync::Arc;
use tracing::debug;

/// Handles DELETE requests for a specific site
///
/// Deletes the site with the ID specified in the path parameters
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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::response::IntoResponse;
    use sea_orm::{DatabaseBackend, MockDatabase, MockExecResult};

    /// Tests successful deletion of an existing record
    #[tokio::test]
    async fn test_existing_record() {
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_exec_results(vec![MockExecResult::default()])
            .into_connection();

        let state = State(Arc::new(AppState {
            database_connection,
        }));
        let query = Path(PathParams { id: 1 });

        let response = handler(state, query)
            .await
            .expect("handler should not fail with existing record")
            .into_response();

        assert_eq!(StatusCode::NO_CONTENT, response.status());
    }

    /// Tests deletion when record doesn't exist
    ///
    /// Note: This test demonstrates that no error is returned when
    /// deleting a non-existent record. The API returns NO_CONTENT
    /// regardless of whether the site existed before.
    #[tokio::test]
    async fn test_non_existing_record() {
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_exec_results(vec![MockExecResult::default()])
            .into_connection();

        let state = State(Arc::new(AppState {
            database_connection,
        }));
        let query = Path(PathParams { id: 1 });

        let response = handler(state, query)
            .await
            .expect("handler should not fail with non existing record")
            .into_response();

        assert_eq!(StatusCode::NO_CONTENT, response.status());
    }
}
