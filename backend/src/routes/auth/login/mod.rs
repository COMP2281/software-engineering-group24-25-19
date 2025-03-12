mod post;

use crate::app_state::AppState;
use axum::{routing, Router};
use std::sync::Arc;

/// Returns a router for endpoints under `/login`
pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", routing::post(post::handler))
}
