mod get;
mod post;

mod _id;

use crate::app_state::AppState;
use axum::{routing, Router};
use std::sync::Arc;

pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", routing::get(get::handler))
        .route("/", routing::post(post::handler))
        .nest("/{id}", _id::router())
}
