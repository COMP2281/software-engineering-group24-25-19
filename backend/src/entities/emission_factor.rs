use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "emission_factor")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub start_year: i32,
    pub end_year: i32,
    pub gas: f64,
    pub electricity: f64,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
