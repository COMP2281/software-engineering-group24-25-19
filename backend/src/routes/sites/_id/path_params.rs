use serde::Deserialize;

/// Path parameters for site-specific endpoints
///
/// Contains the numeric ID for identifying a specific site
#[derive(Debug, Deserialize)]
pub(super) struct PathParams {
    pub id: i32,
}
