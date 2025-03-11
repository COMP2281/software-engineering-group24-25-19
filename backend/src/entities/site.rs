use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

/// Represents a site record
#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "site")]
pub struct Model {
    /// Primary key for site record
    #[sea_orm(primary_key)]
    #[serde(skip_deserializing)]
    pub id: i32,
    /// Name of the site
    pub name: String,
    /// Floor area in square meters (optional)
    pub floor_area_square_metre: Option<f64>,
    /// Unique property reference number (optional)
    pub unique_property_reference_number: Option<String>,
    /// NI185 energy user classification (optional)
    pub ni185_energy_user: Option<String>,
    /// Additional comments about the site (optional)
    pub comment: Option<String>,
}

/// Defines relations for the site table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::electricity_usage_record::Entity")]
    ElectricityUsageRecord,
}

/// Implements the Related trait for electricity usage records
impl Related<super::electricity_usage_record::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ElectricityUsageRecord.def()
    }
}

/// Implements default behavior for the `ActiveModel`
impl ActiveModelBehavior for ActiveModel {}
