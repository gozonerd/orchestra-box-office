//! Report and reporting models.

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use crate::finance::Money;

/// Generated financial report (PDF/DOCX export).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Report {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub total_spend: Money,
    pub total_outcomes: u32,
    pub average_roi_percent: Decimal,
    pub generated_at: DateTime<Utc>,
}

/// Summary statistics for a report.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ReportSummary {
    pub total_pipelines: u32,
    pub total_runs: u32,
    pub total_spend: Money,
    pub total_outcomes: u32,
    pub average_cost_per_outcome: Money,
    pub period_days: u32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_report_serialization() {
        let report = Report {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            title: "Q2 2026 ROI Report".to_string(),
            period_start: Utc::now(),
            period_end: Utc::now(),
            total_spend: Money::from_cents(500000),
            total_outcomes: 150,
            average_roi_percent: Decimal::new(30000, 2),
            generated_at: Utc::now(),
        };
        let json = serde_json::to_string(&report).unwrap();
        let deserialized: Report = serde_json::from_str(&json).unwrap();
        assert_eq!(report, deserialized);
    }

    #[test]
    fn test_report_summary_serialization() {
        let summary = ReportSummary {
            total_pipelines: 5,
            total_runs: 200,
            total_spend: Money::from_cents(500000),
            total_outcomes: 150,
            average_cost_per_outcome: Money::from_cents(333333),
            period_days: 90,
        };
        let json = serde_json::to_string(&summary).unwrap();
        let deserialized: ReportSummary = serde_json::from_str(&json).unwrap();
        assert_eq!(summary, deserialized);
    }
}
