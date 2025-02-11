use crate::api_error::ApiError;

pub(super) async fn handler() -> ApiError {
    ApiError::RouteNotFound
}
