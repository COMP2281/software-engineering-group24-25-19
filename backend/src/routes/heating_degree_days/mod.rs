mod get;

use crate::app_state::AppState;
use axum::{routing, Router};
use std::sync::Arc;

pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", routing::get(get::handler))
    // a nedted route for handling gas usage records
    // router creates a new Router instance and nests the /records route
}
