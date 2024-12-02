pub mod electricity_usage;
pub mod gas_usage;
pub mod upload;

use axum::Router;

pub fn create_router() -> Router {
    Router::new()
        .nest("/upload", upload::router())
        .nest("/gas-usage", gas_usage::router())
        .nest("/electricity-usage", electricity_usage::router())
}
