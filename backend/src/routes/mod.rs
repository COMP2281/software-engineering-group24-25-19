mod electricity_usage;
mod emission_factors;
mod fallback;
mod gas_usage;
mod heating_degree_days;
mod sites;
mod upload;

use crate::app_state::AppState;
use axum::Router;
use std::sync::Arc;

pub fn create_router(shared_state: Arc<AppState>) -> Router {
    Router::new()
        .nest("/electricity-usage", electricity_usage::router())
        .nest("/emission-factors", emission_factors::router())
        .nest("/gas-usage", gas_usage::router())
        .nest("/heating-degree-days", heating_degree_days::router())
        .nest("/sites", sites::router())
        .nest("/upload", upload::router())
        .fallback(fallback::handler)
        .with_state(shared_state)
}
