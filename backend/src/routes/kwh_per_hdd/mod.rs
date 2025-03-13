mod records;

use crate::app_state::AppState;
use axum::Router;
use std::sync::Arc;

/// Returns a router for endpoints under `/kwh-per-hdd`
pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().nest("/records", records::router())
}
