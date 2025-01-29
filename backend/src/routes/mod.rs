mod electricity_usage;
mod emission_factors;
mod gas_usage;
mod sites;
mod upload;

use crate::structs::AppState;
use axum::Router;
use std::sync::Arc;

pub fn create_router(shared_state: Arc<AppState>) -> Router {
    Router::new()
        .nest("/electricity-usage", electricity_usage::router())
        .nest("/emission-factors", emission_factors::router())
        .nest("/gas-usage", gas_usage::router())
        .nest("/sites", sites::router())
        .nest("/upload", upload::router())
        .with_state(shared_state)
}
