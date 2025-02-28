use sea_orm::entity::prelude::*;
use serde::Serialize;

// create a struct that represents the electricity_usage_record table
#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "electricity_usage_record")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub site_id: i32,
    pub start_year: i32,
    pub end_year: i32,
    pub energy_usage_kwh: i32,
    pub cost_gbp: Option<f64>,
}
// define the primary key
// define the site_id column in 32-bit integer format
// define the start_year column in 32-bit integer format
// define the end_year column in 32-bit integer format
// define the energy_usage_kwh column in 32-bit integer format
// define the cost_gbp column in 64-bit floating point format

// create an enum that represents the relations of the electricity_usage_record table

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]

// foreign key relation to the site table
// define the relation between the electricity_usage_record table and the site table
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::site::Entity",
                // define the relation as a belongs_to relation

        from = "Column::SiteId",
                // define the column in the electricity_usage_record table that the relation is from

        to = "super::site::Column::Id"
                // define the column in the site table that the relation is to

    )]
    Site,
}
// implement the ActiveModelBehavior trait for the Model struct

impl Related<super::site::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Site.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
