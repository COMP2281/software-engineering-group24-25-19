use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize)]
// derive the EntityModel trait for the Model struct
#[sea_orm(table_name = "emission_factor")]
// define the table name in the database
pub struct Model {
    #[sea_orm(primary_key)]
    // define the primary key (startt_year)
    pub start_year: i32,
    // start_year in 32-bit integer
    pub end_year: i32,
    // end_year in 32-bit integer
    pub gas: f64,
    // gas in 64-bit float
    pub electricity: f64,
    //electricity in 64-bit float
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}
// an empty enum for defining relations

// implement default bahaviour for the Model struct
impl ActiveModelBehavior for ActiveModel {}
