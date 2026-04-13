//! Pipeline and pipeline run models.

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::finance::Money;

/// Definition of an AI pipeline (e.g., "Support Bot", "Code Generator").
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PipelineDefinition {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub cost_per_run: Money,  // Fixed cost for each invocation
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Single execution of a pipeline (with outcomes).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PipelineRun {
    pub id: Uuid,
    pub pipeline_id: Uuid,
    pub user_id: Uuid,
    pub cost: Money,
    pub outcomes_produced: u32,  // Business outcomes (e.g., tickets resolved)
    pub timestamp: DateTime<Utc>,
    pub notes: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pipeline_definition_serialization() {
        let def = PipelineDefinition {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            name: "Support Bot".to_string(),
            description: Some("Resolves common support tickets".to_string()),
            cost_per_run: Money::from_cents(25),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let json = serde_json::to_string(&def).unwrap();
        let deserialized: PipelineDefinition = serde_json::from_str(&json).unwrap();
        assert_eq!(def, deserialized);
    }

    #[test]
    fn test_pipeline_run_serialization() {
        let run = PipelineRun {
            id: Uuid::new_v4(),
            pipeline_id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            cost: Money::from_cents(25),
            outcomes_produced: 5,
            timestamp: Utc::now(),
            notes: Some("Successfully resolved issues".to_string()),
        };
        let json = serde_json::to_string(&run).unwrap();
        let deserialized: PipelineRun = serde_json::from_str(&json).unwrap();
        assert_eq!(run, deserialized);
    }
}
