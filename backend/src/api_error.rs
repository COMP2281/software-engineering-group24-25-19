use axum::{
    extract::{
        multipart::MultipartError,
        rejection::{JsonRejection, PathRejection},
    },
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use axum_extra::extract::QueryRejection;
use calamine::XlsxError;
use sea_orm::DbErr;
use serde::Serialize;
use std::error::Error as _;
use thiserror::Error;

// serialize the ErrorResponse struct
#[derive(Serialize)]
struct ErrorResponse {
    message: String,
    error: Option<String>,
    // ErrorResponse struct contains a message (string) and an error (optional and string)
}

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("InvalidPath")]
    InvalidPath(#[from] PathRejection),
    #[error("InvalidQuery")]
    InvalidQuery(#[from] QueryRejection),
    #[error("InvalidJson")]
    InvalidJson(#[from] JsonRejection),
    #[error("MultipartFailure")]
    MultipartFailure(#[from] MultipartError),
    #[error("ExcelFailure")]
    ExcelFailure(#[from] XlsxError),
    #[error("DatabaseError")]
    DatabaseFailure(#[from] DbErr),
    #[error("RouteNotFound")]
    RouteNotFound,
    // listing the possible errors that can occur in the API
    // invalid path, query, json, multipart, excel, database, and route not found
}
// implement the IntoResponse trait for the ApiError enum
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status_code = match self {
            // match the error variant and return the corresponding status code
            ApiError::InvalidPath(_)
            | ApiError::InvalidQuery(_)
            | ApiError::InvalidJson(_)
            | ApiError::MultipartFailure(_)
            | ApiError::ExcelFailure(_) => StatusCode::BAD_REQUEST,
            ApiError::DatabaseFailure(ref variant) => match variant {
                DbErr::RecordNotFound(_) => StatusCode::NOT_FOUND,
                _ => StatusCode::INTERNAL_SERVER_ERROR,
            },
            ApiError::RouteNotFound => StatusCode::NOT_FOUND,
        };

        (
            // return a response with the status code and the ErrorResponse struct
            status_code,
            Json(ErrorResponse {
                message: self.to_string(),
                error: self.source().map(|source| source.to_string()),
            }),
            // return the error message and the source of the error
        )
            .into_response()
    }
}
