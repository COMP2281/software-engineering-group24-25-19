use crate::structs::{ApiError, AppState};
use axum::{
    extract::{Multipart, State},
    routing::post,
    Router,
};
use calamine::{open_workbook_from_rs, Reader, Xlsx};
use std::io::Cursor;
use std::sync::Arc;

async fn upload(
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> Result<(), ApiError> {
    while let Some(field) = multipart.next_field().await? {
        // TODO: validate the field against the API specification

        let data = Cursor::new(field.bytes().await?);

        let mut workbook: Xlsx<_> = open_workbook_from_rs(data)?;

        // quick test code to see if the data is properly received
        if let Ok(r) = workbook.worksheet_range("Sheet") {
            for row in r.rows() {
                println!("row={:?}, row[0]={:?}", row, row[0])
            }
        }

        // TODO: data cleansing and save to database
    }

    Ok(())
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", post(upload))
}
