use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub(super) struct PathParams {
    pub id: i32,
}
