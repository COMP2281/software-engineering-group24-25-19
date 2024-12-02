use crate::structs::ApiError;
use axum::extract::Query;
use axum::{routing::get, Router};
use serde::Deserialize;

#[derive(Deserialize)]
struct ElectricityUsageParams {
    start_year: Option<u32>,
    // TODO: more to be added
}

async fn electricity_usage(params: Option<Query<ElectricityUsageParams>>) -> Result<(), ApiError> {
    unimplemented!();
}

pub fn router() -> Router {
    Router::new().route("/", get(electricity_usage))
}
