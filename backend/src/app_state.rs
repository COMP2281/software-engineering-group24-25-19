use sea_orm::DatabaseConnection;

/// Application state shared across all requests
///
/// Contains the database connection used by request handlers
pub struct AppState {
    pub database_connection: DatabaseConnection,
}
