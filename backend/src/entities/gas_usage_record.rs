use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "gas_usage_record")]
// define the table name in the database
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub site_id: i32,
    pub start_year: i32,
    pub end_year: i32,
    pub energy_usage_kwh: i32,
    pub cost_gbp: Option<f64>,
}

// primary key in 32-bit integer
// site_id in 32-bit integer
// start_year in 32-bit integer
// end_year in 32-bit integer
// energy_usage_kwh in 32-bit integer
// cost_gbp in 64-bit float

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]

// define an enum for relations
pub enum Relation {
    // define a relation to the site entity (foreign key)
    #[sea_orm(
        belongs_to = "super::site::Entity",
        from = "Column::SiteId",
        to = "super::site::Column::Id"
    )]
    Site,
}

// implement the Related trait for the Entity struct
impl Related<super::site::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Site.def()
    }
}

// implement default bahaviour for the Model struct
impl ActiveModelBehavior for ActiveModel {}
