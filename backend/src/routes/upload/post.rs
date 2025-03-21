use crate::{api_error::ApiError, app_state::AppState};
use axum::{
    extract::{Multipart, State},
    http::StatusCode,
};
use calamine::{open_workbook_from_rs, Reader, Xlsx};
use std::io::Cursor;
use std::sync::Arc;

/// Handles POST requests for file uploads
///
/// Processes uploaded Excel files from multipart form data.
pub(super) async fn handler(
    State(_state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> Result<StatusCode, ApiError> {
    while let Some(field) = multipart.next_field().await? {
        // TODO: validate the field against the API specification

        let data = Cursor::new(field.bytes().await?);

        let mut workbook: Xlsx<_> = open_workbook_from_rs(data)?;

        // Read the first worksheet for demonstration purposes
        if let Ok(r) = workbook.worksheet_range("Sheet") {
            for row in r.rows() {
                println!("row={:?}, row[0]={:?}", row, row[0]);
            }
        }

        // TODO: data cleansing and save to database
    }

    Ok(StatusCode::CREATED)
}
