use crate::api_error::ApiError;

/// Handles unmatched routes.
///
/// Returns a `RouteNotFound` error, which is then converted into an error response in JSON format.
pub(super) async fn handler() -> ApiError {
    ApiError::RouteNotFound
}
