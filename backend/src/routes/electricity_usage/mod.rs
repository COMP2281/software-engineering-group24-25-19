mod records;

use crate::app_state::AppState;
use axum::Router;
use std::sync::Arc;
// defines the routes for electricity usage
pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().nest("/records", records::router())
    // a nedted route for handling electricity usage records
    // router creates a new Router instance and nests the /records route
}
