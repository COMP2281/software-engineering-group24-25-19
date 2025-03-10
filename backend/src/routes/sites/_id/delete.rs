use super::path_params::PathParams;
use crate::{api_error::ApiError, app_state::AppState, custom_extractors::Path, entities::site};
use axum::{extract::State, http::StatusCode};
use sea_orm::EntityTrait as _;
use std::sync::Arc;
use tracing::debug;

// create a handler function for the DELETE request
// the handler function takes the application state and the path parameters as arguments
// the path parameters are extracted from the request path
// the handler function returns a Result containing a StatusCode and an ApiError
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Path(path_params): Path<PathParams>,
) -> Result<StatusCode, ApiError> {
    debug!("path_params = {:?}", path_params);

    site::Entity::delete_by_id(path_params.id)
        .exec(&state.database_connection)
        .await?;
    // returns a 204 No Content status code if the record is successfully deleted
    Ok(StatusCode::NO_CONTENT)
}

// test module for the handler function
// the test module is only compiled when running tests
#[cfg(test)]
mod tests {
    use super::*;
    use axum::response::IntoResponse;
    use sea_orm::{DatabaseBackend, MockDatabase, MockExecResult};

    #[tokio::test]
    // test case for deleting an existing record
    async fn test_existing_record() {
        // establish a mock database connection with
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_exec_results(vec![MockExecResult::default()])
            .into_connection();
        // state instance with a mock database connection
        let state = State(Arc::new(AppState {
            database_connection,
        }));
        // query parameters for the request
        let query = Path(PathParams { id: 1 });
        // create a new State instance with a mock database connection
        let response = handler(state, query)
            .await
            .expect("handler should not fail with existing record")
            .into_response();
        // status code of the response should be 204 No Content
        assert_eq!(StatusCode::NO_CONTENT, response.status());
    }

    #[tokio::test]
    // test case for deleting a non-existing record
    async fn test_non_existing_record() {
        // establish a mock database connection with
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_exec_results(vec![MockExecResult::default()])
            .into_connection();
        // state instance with a mock database connection
        let state = State(Arc::new(AppState {
            database_connection,
        }));
        // query parameters for the request
        let query = Path(PathParams { id: 1 });

        let response = handler(state, query)
            .await
            .expect("handler should not fail with non existing record")
            .into_response();
        // status code of the response should be 204 No Content
        assert_eq!(StatusCode::NO_CONTENT, response.status());
    }
}
