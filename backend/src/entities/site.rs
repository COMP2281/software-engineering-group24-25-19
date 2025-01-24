use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "site")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
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
