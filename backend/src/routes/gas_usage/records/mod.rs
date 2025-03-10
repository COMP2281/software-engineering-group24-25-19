mod get;

use crate::app_state::AppState;
use axum::{routing, Router};
use std::sync::Arc;

pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", routing::get(get::handler))
    // create a new Router instance and define a route for the gas usage records endpoint
    // the route uses the GET method and the handler function from the get module
}
