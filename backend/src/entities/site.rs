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
    //id in 32-bit integer and as primary key
    //name in string
    //floor_area_square_metre in 64-bit float
    //unique_property_reference_number in string
    //ni185_energy_user in string
    //comment in string
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
// derive the EnumIter and DeriveRelation traits for the Relation enum
pub enum Relation {
    #[sea_orm(has_many = "super::electricity_usage_record::Entity")]
    ElectricityUsageRecord,
}
// implement the ActiveModelBehavior trait for the Model struct
impl Related<super::electricity_usage_record::Entity> for Entity {
    // define the relation between the site table and the electricity_usage_record table
    fn to() -> RelationDef {
        Relation::ElectricityUsageRecord.def()
    }
}
// implement default bahaviour for the Model struct
impl ActiveModelBehavior for ActiveModel {}
