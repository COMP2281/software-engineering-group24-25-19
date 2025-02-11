use crate::api_error::ApiError;

pub async fn handler() -> ApiError {
    ApiError::RouteNotFound
}
