use sea_orm::entity::prelude::*; 

/// Represents the `access_code` database table
/// Specifies the table name in the database
#[derive(Clone, Debug, Default, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "access_code")]
pub struct Model {
    /// Unique identifier for each access code, serving as the primary key
    #[sea_orm(primary_key)]
    pub id: i32,
    /// Stores the hashed access code for authentication
    pub hashed_code: String,

    /// User access level (1 = View only, 2 = Edit permissions)
    /// Determines if the user has view or edit privileges
    pub access_level: i32,
}

/// Defines the relationships associated with the `access_code` table
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

/// Implements the default behavior for the `access_code` ActiveModel
/// Enables standard CRUD operations for the entity
impl ActiveModelBehavior for ActiveModel {}