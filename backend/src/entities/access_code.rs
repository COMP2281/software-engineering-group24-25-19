use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "access_code")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub hashed_code: String,
    pub access_level: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
