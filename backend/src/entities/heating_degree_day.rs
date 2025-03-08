use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize)]
#[sea_orm(table_name = "heating_degree_day")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub start_year: i32,
    pub end_year: i32,
    pub april: Option<i32>,
    pub may: Option<i32>,
    pub june: Option<i32>,
    pub july: Option<i32>,
    pub august: Option<i32>,
    pub september: Option<i32>,
    pub october: Option<i32>,
    pub november: Option<i32>,
    pub december: Option<i32>,
    pub january: Option<i32>,
    pub february: Option<i32>,
    pub march: Option<i32>,
    pub total: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
