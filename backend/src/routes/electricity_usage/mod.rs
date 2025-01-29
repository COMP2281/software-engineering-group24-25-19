pub mod records;

use crate::structs::AppState;
use axum::Router;
use std::sync::Arc;

pub fn router() -> Router<Arc<AppState>> {
    Router::new().nest("/records", records::router())
}
