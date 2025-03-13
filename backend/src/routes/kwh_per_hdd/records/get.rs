use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    entities::{gas_usage_record, heating_degree_day},
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait, Condition, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tracing::debug;

/// Query parameters for filtering records
#[derive(Deserialize, Debug)]
#[serde(crate = "serde")]
pub(super) struct QueryParams {
    pub site_ids: Option<Vec<i32>>,
    pub start_years: Option<Vec<i32>>,
}

/// Response structure for kWh per HDD records
#[derive(Serialize, Debug)]
#[serde(crate = "serde")]
pub(super) struct KwhPerHddRecord {
    pub site_id: i32,
    pub start_year: i32,
    pub end_year: i32,
    pub kwh_per_hdd: f64,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<KwhPerHddRecord>>), ApiError> {
    debug!("query_params = {:?}", query_params);

    let gas_conditions = Condition::all()
        .add_option(
            query_params
                .site_ids
                .as_ref()
                .map(|ids| gas_usage_record::Column::SiteId.is_in(ids.clone())),
        )
        .add_option(
            query_params
                .start_years
                .as_ref()
                .map(|years| gas_usage_record::Column::StartYear.is_in(years.clone())),
        );

    let gas_records = gas_usage_record::Entity::find()
        .filter(gas_conditions)
        .all(&state.database_connection)
        .await?;

    let start_years: Vec<i32> = gas_records.iter().map(|record| record.start_year).collect();

    // Fetch heating degree days for relevant years
    let hdd_records = heating_degree_day::Entity::find()
        .filter(heating_degree_day::Column::StartYear.is_in(start_years))
        .all(&state.database_connection)
        .await?;

    // Map start_year to HDD total
    let hdd_map: HashMap<i32, heating_degree_day::Model> = hdd_records
        .into_iter()
        .map(|hdd| (hdd.start_year, hdd))
        .collect();

    let mut results = Vec::new();
    for gas_record in gas_records {
        if let Some(hdd) = hdd_map.get(&gas_record.start_year) {
            let total_hdd = hdd.total as f64;

            if total_hdd == 0.0 {
                continue;
            }

            let kwh_per_hdd = (gas_record.energy_usage_kwh as f64) / total_hdd;
            results.push(KwhPerHddRecord {
                site_id: gas_record.site_id,
                start_year: gas_record.start_year,
                end_year: gas_record.end_year,
                kwh_per_hdd: (kwh_per_hdd * 100.0).round() / 100.0,
            });
        }
    }

    // Sort results by site_id and start_year
    results.sort_by(|a, b| {
        a.site_id
            .cmp(&b.site_id)
            .then(a.start_year.cmp(&b.start_year))
    });

    Ok((StatusCode::OK, Json(results)))
}
