use sea_orm::entity::prelude::*;
use serde::Serialize;

/// Represents heating degree days data for a fiscal year.
#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "heating_degree_day")]
pub struct Model {
    /// Primary key - starting year of the heating degree day period
    #[sea_orm(primary_key)]
    pub start_year: i32,
    /// Ending year of the heating degree day period
    pub end_year: i32,
    /// Heating degree days for April (optional)
    pub april: Option<i32>,
    /// Heating degree days for May (optional)
    pub may: Option<i32>,
    /// Heating degree days for June (optional)
    pub june: Option<i32>,
    /// Heating degree days for July (optional)
    pub july: Option<i32>,
    /// Heating degree days for August (optional)
    pub august: Option<i32>,
    /// Heating degree days for September (optional)
    pub september: Option<i32>,
    /// Heating degree days for October (optional)
    pub october: Option<i32>,
    /// Heating degree days for November (optional)
    pub november: Option<i32>,
    /// Heating degree days for December (optional)
    pub december: Option<i32>,
    /// Heating degree days for January (optional)
    pub january: Option<i32>,
    /// Heating degree days for February (optional)
    pub february: Option<i32>,
    /// Heating degree days for March (optional)
    pub march: Option<i32>,
    /// Total heating degree days for the year period
    pub total: i32,
}

/// Defines relations for the `heating_degree_day` table (currently empty)
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

/// Implements default behavior for the `ActiveModel`
impl ActiveModelBehavior for ActiveModel {}
