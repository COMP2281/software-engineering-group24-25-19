use crate::app_state::AppState;
use axum::{
    extract::{Request, State},
    http::{header::AUTHORIZATION, StatusCode},
    response::{IntoResponse, Json},
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// JWT claims structure for authentication tokens
///
/// Contains user identification and access control information
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// Subject identifier (user ID or hashed access code)
    pub sub: String,
    /// Token expiration timestamp (in seconds since Unix epoch)
    pub exp: usize,
    /// User's access level for authorization
    pub access_level: u8,
}

/// Handles POST requests for session verification
///
/// Validates the JWT token from the Authorization header and returns
/// the user's identity and access level if authentication is successful
#[axum::debug_handler]
pub async fn post(
    State(_state): State<Arc<AppState>>,
    req: Request,
) -> Result<impl IntoResponse, impl IntoResponse> {
    // Extract the Authorization header
    let auth_header = req.headers().get(AUTHORIZATION);
    // Check if the Authorization header is present
    if auth_header.is_none() {
        tracing::warn!("No Authorization header found in request");
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(
                serde_json::json!({"status": "unauthorised", "message": "Authorization header not found"}),
            ),
        ));
    }

    // Parse the Authorization header value to a string
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

    // Verify the token uses Bearer authentication scheme
    if !auth_value_str.starts_with("Bearer ") {
        tracing::warn!("Authorization header is not a Bearer token");
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(
                serde_json::json!({"status": "unauthorised", "message": "Authorization header is not a Bearer token"}),
            ),
        ));
    }

    // Extract the token by removing the "Bearer " prefix
    let token_value = &auth_value_str[7..];
    let secret = "secret"; // TODO: Read from config/env variable
    let decoding_key = DecodingKey::from_secret(secret.as_bytes());

    // Set up validation criteria for the token
    let mut validation = Validation::default();
    validation.validate_exp = true;

    // Decode and validate the JWT token
    match decode::<Claims>(token_value, &decoding_key, &validation) {
        Ok(decoded_token) => {
            // Token is valid - return user information
            tracing::info!(
                "Session token successfully verified for user: {}, access_level: {}",
                decoded_token.claims.sub,
                decoded_token.claims.access_level
            );
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
            // Token validation failed
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
