mod entities;
mod routes;
mod structs;

use anyhow::Result;
use axum::http::header::CONTENT_TYPE;
use sea_orm::Database;
use std::env;
use std::sync::Arc;
use structs::AppState;
use tower_http::cors::{AllowMethods, AllowOrigin, CorsLayer};
use tracing::{info, instrument};

#[tokio::main]
#[instrument]
async fn main() -> Result<()> {
    // enable logging with tracing
    tracing_subscriber::fmt::init();

    let database_url =
        env::var("DATABASE_URL").expect("`DATABASE_URL` environment variable must be set");
    let database_connection = Database::connect(database_url).await?;
    let shared_state = Arc::new(AppState {
        database_connection,
    });

    let app = routes::create_router(shared_state).layer(
        CorsLayer::new()
            .allow_headers([CONTENT_TYPE])
            .allow_methods(AllowMethods::any())
            .allow_origin(AllowOrigin::any()),
    );

    // TODO: make binding address configurable
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await?;

    info!("Serving API endpoints at {}", listener.local_addr()?);
    axum::serve(listener, app).await?;

    Ok(())
}
