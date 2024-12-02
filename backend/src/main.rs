mod routes;
mod structs;

use anyhow::Result;
use tracing::{info, instrument};

#[tokio::main]
#[instrument]
async fn main() -> Result<()> {
    // enable logging with tracing
    tracing_subscriber::fmt::init();

    let app = routes::create_router();

    // TODO: make binding address configurable
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await?;

    info!("Serving API endpoints at {}", listener.local_addr()?);
    axum::serve(listener, app).await?;

    Ok(())
}
