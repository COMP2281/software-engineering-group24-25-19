pub mod electricity_usage;
pub mod emission_factors;
pub mod gas_usage;
pub mod sites;
pub mod upload;

use crate::structs::AppState;
use axum::Router;
use std::sync::Arc;

pub fn create_router(shared_state: Arc<AppState>) -> Router {
    Router::new()
        .nest("/sites", sites::router())
        .nest("/upload", upload::router())
        .nest("/gas-usage", gas_usage::router())
        .nest("/electricity-usage", electricity_usage::router())
        .nest("/emission-factors", emission_factors::router())
        .with_state(shared_state)
}
