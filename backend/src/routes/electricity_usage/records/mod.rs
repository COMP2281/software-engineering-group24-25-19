mod get;

use crate::app_state::AppState;
use axum::{routing, Router};
use std::sync::Arc;

/// Returns a router for endpoints under `/electricity-usage/records`
pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", routing::get(get::handler))
}
