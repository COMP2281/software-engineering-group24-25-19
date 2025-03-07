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

/// The `Model` struct represents a site entity in the database.
/// 
/// # Fields
/// 
/// * `id` - The primary key of the site. This field is automatically generated and skipped during deserialization.
/// * `name` - The name of the site.
/// * `floor_area_square_metre` - The floor area of the site in square meters. This field is optional.
/// * `unique_property_reference_number` - A unique reference number for the property. This field is optional.
/// * `ni185_energy_user` - The NI185 energy user classification. This field is optional.
/// * `comment` - Additional comments about the site. This field is optional.
/// 
/// The struct derives several traits:
/// 
/// * `Clone` - Allows the struct to be cloned.
/// * `Debug` - Enables formatting the struct using the `{:?}` formatter.
/// * `Default` - Provides a default value for the struct.
/// * `PartialEq` - Allows comparison of the struct for equality.
/// * `DeriveEntityModel` - Derives the necessary code for the SeaORM entity model.
/// * `Serialize` - Enables serialization of the struct.
/// * `Deserialize` - Enables deserialization of the struct, except for the `id` field which is skipped.
///
/// The `Relation` enum defines the relationships of the `Model` struct with other entities.
/// 
/// # Variants
/// 
/// * `ElectricityUsageRecord` - Represents a one-to-many relationship with the `ElectricityUsageRecord` entity.
/// 
/// The `Related` trait implementation specifies the relationship between the `Model` and `ElectricityUsageRecord` entities.
/// 
/// The `ActiveModelBehavior` trait implementation provides custom behavior for the active model.