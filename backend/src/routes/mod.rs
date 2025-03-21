mod auth;
mod carbon_emissions;
mod electricity_usage;
mod emission_factors;
mod fallback;
mod gas_usage;
mod heating_degree_days;
mod kwh_per_hdd;
mod sites;
mod upload;

use crate::app_state::AppState;
use axum::Router;
use std::sync::Arc;

/// Returns the application router with all route definitions
///
/// Configures all API endpoints and attaches the shared application state
pub fn create_router(shared_state: Arc<AppState>) -> Router {
    Router::new()
        .nest("/auth", auth::router())
        .nest("/carbon-emissions", carbon_emissions::router())
        .nest("/electricity-usage", electricity_usage::router())
        .nest("/emission-factors", emission_factors::router())
        .nest("/gas-usage", gas_usage::router())
        .nest("/heating-degree-days", heating_degree_days::router())
        .nest("/kwh-per-hdd", kwh_per_hdd::router())
        .nest("/sites", sites::router())
        .nest("/upload", upload::router())
        .fallback(fallback::handler)
        .with_state(shared_state)
}
