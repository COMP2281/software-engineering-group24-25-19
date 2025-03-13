use crate::app_state::AppState;
use axum::{
    extract::{Request, State},
    http::{header::AUTHORIZATION, StatusCode},
    response::{IntoResponse, Json},
};
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
    req: Request,
) -> Result<impl IntoResponse, impl IntoResponse> {
    // Extract the Authorization header
    let auth_header = req.headers().get(AUTHORIZATION);

    if auth_header.is_none() {
        tracing::warn!("No Authorization header found in request");
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(
                serde_json::json!({"status": "unauthorised", "message": "Authorization header not found"}),
            ),
        ));
    }

    let auth_header_value = auth_header.unwrap();
    let auth_value_str = match auth_header_value.to_str() {
        Ok(s) => s,
        Err(_) => {
            tracing::warn!("Invalid Authorization header format");
            return Err((
                StatusCode::BAD_REQUEST,
                Json(
                    serde_json::json!({"status": "error", "message": "Invalid Authorization header format"}),
                ),
            ));
        }
    };

    // Check if it's a Bearer token and extract the token value
    if !auth_value_str.starts_with("Bearer ") {
        tracing::warn!("Authorization header is not a Bearer token");
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(
                serde_json::json!({"status": "unauthorised", "message": "Authorization header is not a Bearer token"}),
            ),
        ));
    }

    let token_value = &auth_value_str[7..]; // Remove "Bearer " prefix
    let secret = "secret"; // TODO: Read from config/env variable
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
