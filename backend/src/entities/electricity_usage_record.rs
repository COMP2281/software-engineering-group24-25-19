use sea_orm::entity::prelude::*;
use serde::Serialize;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize)]
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

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::site::Entity",
        from = "Column::SiteId",
        to = "super::site::Column::Id"
    )]
    Site,
}

impl Related<super::site::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Site.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
