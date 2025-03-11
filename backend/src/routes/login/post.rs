use crate::app_state::AppState;
use crate::entities::access_code;
use axum::extract::State;
use axum::Json;
use jsonwebtoken::{encode, EncodingKey, Header};
use md5::compute;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize)]
pub struct LoginRequest {
    code: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    access_level: u8,
    token: Option<String>,
}

#[derive(Serialize)]
pub struct Claims {
    sub: String,
    exp: usize,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Json<LoginResponse> {
    let hashed_code = format!("{:x}", compute(payload.code.as_bytes()));

    let result = access_code::Entity::find()
        .filter(access_code::Column::HashedCode.eq(hashed_code.clone()))
        .one(&state.database_connection)
        .await
        .ok()
        .flatten();

    if let Some(entry) = result {
        let access_level = entry.access_level as u8;
        let token = if access_level > 0 {
            let claims = Claims {
                sub: hashed_code.clone(),
                exp: chrono::Utc::now().timestamp() as usize + 3600,
            };
            Some(
                encode(
                    &Header::default(),
                    &claims,
                    &EncodingKey::from_secret(b"secret"),
                )
                .unwrap(),
            )
        } else {
            None
        };

        return Json(LoginResponse {
            access_level,
            token,
        });
    }

    Json(LoginResponse {
        access_level: 0,
        token: None,
    })
}
