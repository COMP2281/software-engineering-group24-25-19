mod get;

use crate::app_state::AppState;
use axum::{routing, Router};
use std::sync::Arc;

// creates a router for the electricity-usage module
pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", routing::get(get::handler))
    // returns a router instance with a route for GET requests at the root path "/"
}
