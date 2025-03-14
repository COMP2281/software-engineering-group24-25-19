mod api_error;
mod app_state;
mod custom_extractors;
mod entities;
mod routes;

use crate::app_state::AppState;
use anyhow::Result;
use axum::http::header::CONTENT_TYPE;
use sea_orm::Database;
use std::env;
use std::sync::Arc;
use tokio::signal;
use tower_http::cors::{AllowMethods, AllowOrigin, CorsLayer};
use tracing::{info, instrument};

/// Handles the application shutdown signal
///
/// Waits for either SIGINT (Ctrl+C) or SIGTERM and gracefully shuts down the server
async fn shutdown_signal() {
    let sigint = async {
        signal::ctrl_c()
            .await
            .expect("failed to install SIGINT handler");
    };

    let sigterm = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    tokio::select! {
        () = sigint => {},
        () = sigterm => {},
    }
}

/// Application entry point
///
/// Sets up logging, database connection, routing and starts the HTTP server
#[tokio::main]
#[instrument]
async fn main() -> Result<()> {
    // Enable logging with tracing
    tracing_subscriber::fmt::init();

    // Get configuration from environment variables
    let http_bind = env::var("DURMETRICS_HTTP_BIND")
        .expect("`DURMETRICS_HTTP_BIND` environment variable must be set");
    let database_url = env::var("DURMETRICS_DATABASE_URL")
        .expect("`DURMETRICS_DATABASE_URL` environment variable must be set");

    // Connect to the database and create shared application state
    let database_connection = Database::connect(database_url).await?;
    let shared_state = Arc::new(AppState {
        database_connection,
    });

    // Create router with CORS configuration
    let app = routes::create_router(shared_state).layer(
        CorsLayer::new()
            .allow_headers([CONTENT_TYPE, axum::http::header::AUTHORIZATION])
            .allow_methods(AllowMethods::any())
            .allow_origin(AllowOrigin::any()),
    );

    // Start HTTP server with graceful shutdown capability
    let listener = tokio::net::TcpListener::bind(http_bind).await?;
    info!("Serving API endpoints at {}", listener.local_addr()?);
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}
