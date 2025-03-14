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

// define the AppState struct with a database_connection field of type Database
// AppState struct contains a database_connection field of type Database
// AppState struct is used to store the shared state of the application
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

#[tokio::main]
#[instrument]
// main function is the entry point of the application
async fn main() -> Result<()> {
    // enable logging with tracing
    tracing_subscriber::fmt::init();

    // http_bind is the address to bind the HTTP server to
    // database_url is the URL to connect to the database
    // establish a connection to the database
    // shared state is an Arc of the AppState struct
    let http_bind = env::var("DURMETRICS_HTTP_BIND")
        .expect("`DURMETRICS_HTTP_BIND` environment variable must be set");
    let database_url = env::var("DURMETRICS_DATABASE_URL")
        .expect("`DURMETRICS_DATABASE_URL` environment variable must be set");
    let database_connection = Database::connect(database_url).await?;
    let shared_state = Arc::new(AppState {
        database_connection,
    });
    // create the router with the shared state and add the CORS layer
    let app = routes::create_router(shared_state).layer(
        CorsLayer::new()
            .allow_headers([CONTENT_TYPE, axum::http::header::AUTHORIZATION])
            .allow_methods(AllowMethods::any())
            .allow_origin(AllowOrigin::any()),
    );

    let listener = tokio::net::TcpListener::bind(http_bind).await?;
    // bind the HTTP server to the address specified in http_bind
    info!("Serving API endpoints at {}", listener.local_addr()?);
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    // serve the API endpoints and wait for the shutdown signal
    Ok(())
}
