use crate::{api_error::ApiError, app_state::AppState, custom_extractors::Json, entities::site};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ActiveModelTrait as _, ActiveValue::Set};
use serde::Deserialize;
use std::sync::Arc;
use tracing::debug;

#[derive(Debug, Default, Deserialize)]
pub(super) struct Payload {
    pub name: String,
    pub floor_area_square_metre: Option<f64>,
    pub unique_property_reference_number: Option<String>,
    pub ni185_energy_user: Option<String>,
    pub comment: Option<String>,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<Payload>,
) -> Result<(StatusCode, Json<site::Model>), ApiError> {
    debug!("payload = {:?}", payload);

    let new_site = site::ActiveModel {
        name: Set(payload.name),
        floor_area_square_metre: Set(payload.floor_area_square_metre),
        unique_property_reference_number: Set(payload.unique_property_reference_number),
        ni185_energy_user: Set(payload.ni185_energy_user),
        comment: Set(payload.comment),
        ..Default::default()
    };

    let new_site = new_site.insert(&state.database_connection).await?;

    Ok((StatusCode::CREATED, Json(new_site)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::response::IntoResponse;
    use sea_orm::{DatabaseBackend, MockDatabase, MockExecResult};

    #[tokio::test]
    async fn test_valid_json_payload() {
        let database_connection = MockDatabase::new(DatabaseBackend::Postgres)
            .append_exec_results(vec![MockExecResult::default()])
            .append_query_results(vec![vec![site::Model {
                id: 1,
                name: "Site A".to_owned(),
                ..Default::default()
            }]])
            .into_connection();

        let state = State(Arc::new(AppState {
            database_connection,
        }));
        let json = Json(Payload::default());

        let response = handler(state, json)
            .await
            .expect("handler should not fail valid JSON payload")
            .into_response();

        assert_eq!(StatusCode::CREATED, response.status());
    }

    // not possible to test invalid JSON payload due to type constraints
    // need to be done as a part of integration tests
}
