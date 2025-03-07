use sea_orm::DatabaseConnection;

pub struct AppState {
    pub database_connection: DatabaseConnection,
    // define a field for the database connection
}
