pub mod electricity_usage;
pub mod gas_usage;
pub mod upload;

use crate::structs::AppState;
use axum::Router;
use std::sync::Arc;

pub fn create_router(shared_state: Arc<AppState>) -> Router {
    Router::new()
        .nest("/upload", upload::router())
        .nest("/gas-usage", gas_usage::router())
        .nest("/electricity-usage", electricity_usage::router())
        .with_state(shared_state)
}
