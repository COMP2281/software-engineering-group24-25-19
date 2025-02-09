mod delete;
mod get;
mod patch;

mod path_params;

use crate::app_state::AppState;
use axum::{routing, Router};
use std::sync::Arc;

pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", routing::delete(delete::handler))
        .route("/", routing::get(get::handler))
        .route("/", routing::patch(patch::handler))
}
