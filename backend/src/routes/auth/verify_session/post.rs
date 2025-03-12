use crate::app_state::AppState;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Json},
};
use axum_extra::extract::cookie::CookieJar;
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub access_level: u8,
}

#[axum::debug_handler]
pub async fn post(
    State(_state): State<Arc<AppState>>,
    cookies: CookieJar,
) -> Result<impl IntoResponse, impl IntoResponse> {
    let token = cookies.get("authToken");

    if token.is_none() {
        tracing::warn!("No authToken cookie found in request");
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(
                serde_json::json!({"status": "unauthorised", "message": "Session token cookie not found"}),
            ),
        ));
    }

    let token_value = token.unwrap().value();
    let secret = "secret";
    let decoding_key = DecodingKey::from_secret(secret.as_bytes());

    let mut validation = Validation::default();
    validation.validate_exp = true;

    match decode::<Claims>(token_value, &decoding_key, &validation) {
        Ok(decoded_token) => {
            // Token is valid
            tracing::info!(
                "Session token successfully verified for user: {}, access_level: {}",
                decoded_token.claims.sub,
                decoded_token.claims.access_level
            ); // Log access_level
            Ok((
                StatusCode::OK,
                Json(serde_json::json!({
                    "status": "verified",
                    "user_id": decoded_token.claims.sub,
                    "access_level": decoded_token.claims.access_level
                })),
            ))
        }
        Err(e) => {
            tracing::warn!("Session token verification failed for request: {}", e);
            Err((
                StatusCode::UNAUTHORIZED,
                Json(
                    serde_json::json!({"status": "unauthorised", "message": "Session token verification failed"}),
                ),
            ))
        }
    }
}
