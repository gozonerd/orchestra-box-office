//! Budget and budget tracking models.

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::finance::Money;

/// Budget for a pipeline or initiative.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Budget {
    pub id: Uuid,
    pub user_id: Uuid,
    pub pipeline_id: Option<Uuid>,  // Null for org-wide budgets
    pub limit: Money,
    pub period: BudgetPeriod,
    pub alert_threshold_percent: u32,  // Alert at 80%, for example
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Budget period (monthly, quarterly, yearly).
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum BudgetPeriod {
    Monthly,
    Quarterly,
    Yearly,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_budget_serialization() {
        let budget = Budget {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            pipeline_id: Some(Uuid::new_v4()),
            limit: Money::from_cents(100000),
            period: BudgetPeriod::Monthly,
            alert_threshold_percent: 80,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        let json = serde_json::to_string(&budget).unwrap();
        let deserialized: Budget = serde_json::from_str(&json).unwrap();
        assert_eq!(budget, deserialized);
    }

    #[test]
    fn test_budget_period_serialization() {
        let period = BudgetPeriod::Quarterly;
        let json = serde_json::to_string(&period).unwrap();
        let deserialized: BudgetPeriod = serde_json::from_str(&json).unwrap();
        assert_eq!(period, deserialized);
    }
}
