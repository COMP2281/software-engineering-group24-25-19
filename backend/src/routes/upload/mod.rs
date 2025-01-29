mod post;

use crate::structs::AppState;
use axum::{routing, Router};
use std::sync::Arc;

pub(super) fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", routing::post(post::handler))
}
