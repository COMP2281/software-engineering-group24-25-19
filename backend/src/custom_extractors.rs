use crate::api_error::ApiError;
use axum::{
    extract::{FromRequest, FromRequestParts},
    http::request::Parts,
    response::{IntoResponse, Response},
};
use serde::de::DeserializeOwned;

#[derive(Debug, FromRequest)]
// derive the FromRequest trait for the Path struct
#[from_request(via(axum::extract::Path), rejection(ApiError))]
// specify the Path extractor and the rejection type as ApiError
pub struct Path<T>(pub T);
// define the Path struct with a generic type T
impl<S, T> FromRequestParts<S> for Path<T>
// implement the FromRequestParts trait for the Path struct
where
    T: DeserializeOwned + Send,
    S: Send + Sync,
    // specify the generic types T and S
{
    type Rejection = ApiError;
    // define the associated type Rejection as ApiError
    // async function from_request_parts receives a mutable reference to Parts and a reference to S
    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, ApiError> {
        match axum::extract::Path::<T>::from_request_parts(parts, state).await {
            Ok(value) => Ok(Self(value.0)),
            Err(rejection) => Err(ApiError::InvalidPath(rejection)),
        }
    }
}

#[derive(Debug, FromRequest)]
#[from_request(via(axum_extra::extract::Query), rejection(ApiError))]
pub struct Query<T>(pub T);

impl<S, T> FromRequestParts<S> for Query<T>
where
    T: DeserializeOwned + Send,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, ApiError> {
        match axum_extra::extract::Query::<T>::from_request_parts(parts, state).await {
            Ok(value) => Ok(Self(value.0)),
            Err(rejection) => Err(ApiError::InvalidQuery(rejection)),
        }
    }
}

#[derive(Debug, FromRequest)]
#[from_request(via(axum::Json), rejection(ApiError))]
pub struct Json<T>(pub T);

impl<T> IntoResponse for Json<T>
where
    axum::Json<T>: IntoResponse,
{
    fn into_response(self) -> Response {
        axum::Json(self.0).into_response()
    }
}
