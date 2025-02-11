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

#[derive(Serialize)]
struct ErrorResponse {
    message: String,
    error: Option<String>,
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
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status_code = match self {
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
            status_code,
            Json(ErrorResponse {
                message: self.to_string(),
                error: self.source().map(|source| source.to_string()),
            }),
        )
            .into_response()
    }
}
