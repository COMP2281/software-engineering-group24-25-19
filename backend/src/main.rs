use anyhow::Result;
use axum::{routing::get, Router};
use tracing::{info, instrument};

async fn handle_request() -> String {
    info!("Request received");
    "Hello World!".to_string()
}

#[tokio::main]
#[instrument]
async fn main() -> Result<()> {
    // enable logging with tracing
    tracing_subscriber::fmt::init();

    let app = Router::new().route("/", get(handle_request));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await?;

    info!("Serving API endpoints at {}", listener.local_addr()?);
    axum::serve(listener, app).await?;

    Ok(())
}
