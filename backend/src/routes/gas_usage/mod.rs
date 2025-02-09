mod records;

use crate::app_state::AppState;
use axum::Router;
use std::sync::Arc;

pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().nest("/records", records::router())
}
