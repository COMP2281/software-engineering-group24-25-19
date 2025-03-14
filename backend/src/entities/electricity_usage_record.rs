use sea_orm::entity::prelude::*;
use serde::Serialize;

/// Represents an electricity usage record
#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "electricity_usage_record")]
pub struct Model {
    /// Primary key for the record
    #[sea_orm(primary_key)]
    pub id: i32,
    /// Foreign key reference to the site table
    pub site_id: i32,
    /// Starting year of the electricity usage record
    pub start_year: i32,
    /// Ending year of the electricity usage record
    pub end_year: i32,
    /// Electricity usage in kilowatt-hours
    pub energy_usage_kwh: i32,
    /// Cost in British Pounds (optional)
    pub cost_gbp: Option<f64>,
}

/// Defines relations for the `electricity_usage_record` table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    /// Foreign key relation to the site table
    /// Defines the relation between the `electricity_usage_record` table and the site table
    #[sea_orm(
        belongs_to = "super::site::Entity",
        from = "Column::SiteId",
        to = "super::site::Column::Id"
    )]
    Site,
}

/// Implements the Related trait for sites
impl Related<super::site::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Site.def()
    }
}

/// Implements default behavior for the `ActiveModel`
impl ActiveModelBehavior for ActiveModel {}
