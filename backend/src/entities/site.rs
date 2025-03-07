use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "site")]
pub struct Model {
    #[sea_orm(primary_key)]
    #[serde(skip_deserializing)]
    pub id: i32,
    pub name: String,
    pub floor_area_square_metre: Option<f64>,
    pub unique_property_reference_number: Option<String>,
    pub ni185_energy_user: Option<String>,
    pub comment: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::electricity_usage_record::Entity")]
    ElectricityUsageRecord,
}

impl Related<super::electricity_usage_record::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ElectricityUsageRecord.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
