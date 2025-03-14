use crate::app_state::AppState;
use crate::entities::access_code;
use axum::extract::State;
use axum::Json;
use jsonwebtoken::{encode, EncodingKey, Header};
use md5::compute;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Request payload for user login
///
/// Contains the access code provided by the user
#[derive(Deserialize)]
pub struct LoginRequest {
    /// The access code entered by the user
    code: String,
}

/// Response payload for login attempts
///
/// Contains the user's access level and authentication token if successful
#[derive(Serialize)]
pub struct LoginResponse {
    /// The user's authorization level (0 = no access)
    access_level: u8,
    /// JWT token for authenticated sessions (None if authentication failed)
    token: Option<String>,
}

/// JWT claims structure for authentication tokens
///
/// Contains user identification and access control information
#[derive(Serialize)]
pub struct Claims {
    /// Subject identifier (hashed access code)
    sub: String,
    /// Token expiration timestamp (in seconds since Unix epoch)
    exp: usize,
    /// User's access level for authorization
    access_level: u8,
}

/// Handles POST requests for user login
///
/// Verifies the provided access code against the database and generates
/// a JWT token if authentication is successful
pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Json<LoginResponse> {
    // Hash the provided access code with MD5
    let hashed_code = format!("{:x}", compute(payload.code.as_bytes()));

    // Look up the hashed code in the database
    let result = access_code::Entity::find()
        .filter(access_code::Column::HashedCode.eq(hashed_code.clone()))
        .one(&state.database_connection)
        .await
        .ok()
        .flatten();

    // If the access code exists in the database, generate an authentication token
    if let Some(entry) = result {
        let access_level = entry.access_level as u8;
        let token = if access_level > 0 {
            let claims = Claims {
                sub: hashed_code.clone(),
                // Set token expiration to 1 hour from now
                exp: chrono::Utc::now().timestamp() as usize + 3600,
                access_level,
            };

            // Create JWT token with the claims
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
    }

    // Return access level 0 and no token for failed authentication
    Json(LoginResponse {
        access_level: 0,
        token: None,
    })
}
