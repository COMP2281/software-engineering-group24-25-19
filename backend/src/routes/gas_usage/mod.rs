mod records;

use crate::app_state::AppState;
use axum::Router;
use std::sync::Arc;

pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().nest("/records", records::router())
    // create a new Router instance and define a route for the gas usage records endpoint
    // the route uses the GET method and the handler function from the get module
}
