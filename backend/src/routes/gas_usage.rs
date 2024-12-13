use crate::structs::{ApiError, AppState};
use axum::extract::Query;
use axum::{extract::State, routing::get, Router};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
struct GasUsageParams {
    start_year: Option<u32>,
    // TODO: more to be added
}

async fn gas_usage(
    State(state): State<Arc<AppState>>,
    params: Option<Query<GasUsageParams>>,
) -> Result<(), ApiError> {
    unimplemented!();
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(gas_usage))
}
