use crate::{
    api_error::ApiError,
    app_state::AppState,
    custom_extractors::{Json, Query},
    entities::{electricity_usage_record, emission_factor, gas_usage_record},
};
use axum::{extract::State, http::StatusCode};
use sea_orm::{ColumnTrait, Condition, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tracing::debug;

/// Query parameters for filtering records
#[derive(Deserialize, Debug)]
#[serde(crate = "serde")]
pub(super) struct QueryParams {
    pub site_ids: Option<Vec<i32>>,
    pub start_years: Option<Vec<i32>>,
}

/// Response structure for carbon emissions records
#[derive(Serialize, Debug)]
#[serde(crate = "serde")]
pub(super) struct CarbonEmissionRecord {
    pub site_id: i32,
    pub start_year: i32,
    pub end_year: i32,
    pub electricity_energy_usage_kwh: f64,
    pub gas_energy_usage_kwh: f64,
    pub total_emissions: f64,
}

pub(super) async fn handler(
    State(state): State<Arc<AppState>>,
    Query(query_params): Query<QueryParams>,
) -> Result<(StatusCode, Json<Vec<CarbonEmissionRecord>>), ApiError> {
    debug!("query_params = {:?}", query_params);

    // Fetch electricity records
    let elec_conditions = Condition::all()
        .add_option(
            query_params
                .site_ids
                .as_ref()
                .map(|ids| electricity_usage_record::Column::SiteId.is_in(ids.clone())),
        )
        .add_option(
            query_params
                .start_years
                .as_ref()
                .map(|years| electricity_usage_record::Column::StartYear.is_in(years.clone())),
        );

    let elec_records = electricity_usage_record::Entity::find()
        .filter(elec_conditions)
        .all(&state.database_connection)
        .await?;

    // Fetch gas records
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

    // Aggregate electricity usage by (site_id, start_year, end_year)
    let mut elec_sums = HashMap::new();
    for record in elec_records {
        let key = (record.site_id, record.start_year, record.end_year);
        *elec_sums.entry(key).or_insert(0.0) += record.energy_usage_kwh as f64;
    }

    // Aggregate gas usage by (site_id, start_year, end_year)
    let mut gas_sums = HashMap::new();
    for record in gas_records {
        let key = (record.site_id, record.start_year, record.end_year);
        *gas_sums.entry(key).or_insert(0.0) += record.energy_usage_kwh as f64;
    }

    // Collect all unique keys from both electricity and gas sums
    let mut keys_set = HashSet::new();
    for key in elec_sums.keys() {
        keys_set.insert(*key);
    }
    for key in gas_sums.keys() {
        keys_set.insert(*key);
    }

    // Collect start years to fetch emission factors
    let start_years: Vec<i32> = keys_set.iter().map(|k| k.1).collect();

    // Fetch emission factors for the relevant years
    let emission_factors = emission_factor::Entity::find()
        .filter(emission_factor::Column::StartYear.is_in(start_years))
        .all(&state.database_connection)
        .await?;

    let emission_map: HashMap<i32, emission_factor::Model> = emission_factors
        .into_iter()
        .map(|ef| (ef.start_year, ef))
        .collect();

    // Build response records with total emissions
    let mut results = Vec::new();
    for key in keys_set {
        let (site_id, start_year, end_year) = key;

        let electricity_usage = elec_sums.get(&key).copied().unwrap_or(0.0);
        let gas_usage = gas_sums.get(&key).copied().unwrap_or(0.0);

        // Get emission factors or default to 0.0 if not found
        let (electricity_factor, gas_factor) = emission_map
            .get(&start_year)
            .map(|ef| (ef.electricity, ef.gas))
            .unwrap_or((0.0, 0.0));

        let total_emissions =
            (electricity_usage * electricity_factor + gas_usage * gas_factor).round();

        results.push(CarbonEmissionRecord {
            site_id,
            start_year,
            end_year,
            electricity_energy_usage_kwh: electricity_usage,
            gas_energy_usage_kwh: gas_usage,
            total_emissions: (total_emissions * 100.0).round() / 100.0,
        });
    }

    // Sort results by site_id and start_year
    results.sort_by(|a, b| {
        a.site_id
            .cmp(&b.site_id)
            .then(a.start_year.cmp(&b.start_year))
    });

    Ok((StatusCode::OK, Json(results)))
}
