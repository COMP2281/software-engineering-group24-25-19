use sea_orm::entity::prelude::*;
use serde::Serialize;

/// Represents an emission factor record
#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "emission_factor")]
pub struct Model {
    /// Primary key - starting year of the emission factor period
    #[sea_orm(primary_key)]
    pub start_year: i32,
    /// Ending year of the emission factor period
    pub end_year: i32,
    /// Gas emission factor
    pub gas: f64,
    /// Electricity emission factor
    pub electricity: f64,
}

/// Defines relations for the `emission_factor` table (currently empty)
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

/// Implements default behavior for the `ActiveModel`
impl ActiveModelBehavior for ActiveModel {}
