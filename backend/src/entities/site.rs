use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "site")]
// defining site table

pub struct Model {
    #[sea_orm(primary_key)]
    // set id as primary keu
    #[serde(skip_deserializing)]
    // skips deserialising during JSON parsing
    pub id: i32,
    // id in 32-bit integer
    pub name: String,
    // name in string
    pub floor_area_square_metre: Option<f64>,
    // floor_area_square_metre in 64-bit float, optional: can be null
    pub unique_property_reference_number: Option<String>,
    // unique_property_reference_number in string, optional: can be null
    pub ni185_energy_user: Option<String>,
    // ni185_energy_user in string, optional: can be null
    pub comment: Option<String>,
    // comment in string, optional: can be null
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::electricity_usage_record::Entity")]
    ElectricityUsageRecord,
    // defining a one to many relationship with electricity_usage_record entity
}

impl Related<super::electricity_usage_record::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ElectricityUsageRecord.def()
    }
}
// implement the one to many relationship with electricity_usage_record entity

impl ActiveModelBehavior for ActiveModel {}

// implement default bahaviour for the Model struct
