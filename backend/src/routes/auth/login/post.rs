use crate::app_state::AppState;
use crate::entities::access_code;
use axum::extract::State;
use axum::Json;
use jsonwebtoken::{encode, EncodingKey, Header};
use md5::compute;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

// deserialize the request payload
#[derive(Deserialize)]
pub struct LoginRequest {
    // login resquest contains a code in string format
    code: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    access_level: u8,
    token: Option<String>,
    // login response contains an access level (u8)
    // and a token (optional and string)
}

#[derive(Serialize)]
pub struct Claims {
    sub: String,
    exp: usize,
    access_level: u8,
    // claims contains a subject (sub) which is a string
    // an expiration time (exp) which is a usize
    // and an access level which is a u8
}

pub(super) async fn handler(
    // handler function receives a state of type State<AppState> and a payload of type Json<LoginRequest>
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Json<LoginResponse> {
    let hashed_code = format!("{:x}", compute(payload.code.as_bytes()));
    // hash the code using md5 and format it as a string
    let result = access_code::Entity::find()
        .filter(access_code::Column::HashedCode.eq(hashed_code.clone()))
        .one(&state.database_connection)
        .await
        .ok()
        .flatten();
    // find the access code in the database using the hashed code and return the result

    // if the result is found, create a token with the hashed code as the subject
    if let Some(entry) = result {
        let access_level = entry.access_level as u8;
        let token = if access_level > 0 {
            let claims = Claims {
                sub: hashed_code.clone(),
                exp: chrono::Utc::now().timestamp() as usize + 3600,
                // a time allowance of 1 hour
                access_level,
            };
            // match the token creation and return the token if it is created successfully
            match encode(
                &Header::default(),
                &claims,
                &EncodingKey::from_secret(b"secret"),
            ) {
                Ok(t) => Some(t),
                Err(_) => None,
            }
        } else {
            None
        };

        return Json(LoginResponse {
            access_level,
            token,
        });
        // return the access level and the token
    }

    Json(LoginResponse {
        access_level: 0,
        token: None,
        // return access level 0 and no token
    })
}
