use sea_orm::DatabaseConnection;

pub struct AppState {
    pub database_connection: DatabaseConnection,
}
