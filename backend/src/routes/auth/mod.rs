mod login;
mod verify_session;

use crate::app_state::AppState;
use axum::Router;
use std::sync::Arc;

/// Creates a router for endpoints under `/auth`
pub(super) fn router(shared_state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .nest("/login", login::router())
        .nest("/verify_session", verify_session::router())
        .with_state(shared_state)
}
