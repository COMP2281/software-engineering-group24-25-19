mod delete;
mod get;
mod patch;

mod path_params;

use crate::app_state::AppState;
use axum::{routing, Router};
use std::sync::Arc;

/// Creates a router for endpoints under `/sites/{id}`
///
/// Configures routes for GET, PATCH, and DELETE operations on an individual site
pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", routing::delete(delete::handler))
        .route("/", routing::get(get::handler))
        .route("/", routing::patch(patch::handler))
}
