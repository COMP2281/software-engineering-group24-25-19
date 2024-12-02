use crate::structs::ApiError;
use axum::extract::Query;
use axum::{routing::get, Router};
use serde::Deserialize;

#[derive(Deserialize)]
struct GasUsageParams {
    start_year: Option<u32>,
    // TODO: more to be added
}

async fn gas_usage(params: Option<Query<GasUsageParams>>) -> Result<(), ApiError> {
    unimplemented!();
}

pub fn router() -> Router {
    Router::new().route("/", get(gas_usage))
}
