//! Input validation for all entities.
//!
//! All validation functions return Result<(), String> with descriptive error messages.
//! Validation happens at system boundaries, never internally between trusted components.

use crate::finance::Money;
use rust_decimal::Decimal;

/// Validate that a cost is non-negative.
pub fn validate_non_negative_cost(cost: Money) -> Result<(), String> {
    if cost.is_negative() {
        Err("Cost cannot be negative".to_string())
    } else {
        Ok(())
    }
}

/// Validate that a cost is positive (greater than zero).
pub fn validate_positive_cost(cost: Money) -> Result<(), String> {
    if cost.is_zero() {
        Err("Cost must be positive".to_string())
    } else if cost.is_negative() {
        Err("Cost cannot be negative".to_string())
    } else {
        Ok(())
    }
}

/// Validate that a string is non-empty.
pub fn validate_non_empty_string(s: &str, field: &str) -> Result<(), String> {
    if s.trim().is_empty() {
        Err(format!("{} cannot be empty", field))
    } else {
        Ok(())
    }
}

/// Validate that a string is within length bounds.
pub fn validate_string_length(s: &str, field: &str, min: usize, max: usize) -> Result<(), String> {
    let len = s.len();
    if len < min {
        Err(format!("{} must be at least {} characters", field, min))
    } else if len > max {
        Err(format!("{} cannot exceed {} characters", field, max))
    } else {
        Ok(())
    }
}

/// Validate that outcomes count is positive.
pub fn validate_positive_outcomes(count: u32) -> Result<(), String> {
    if count == 0 {
        Err("Outcomes count must be positive".to_string())
    } else {
        Ok(())
    }
}

/// Validate that outcomes count is non-negative.
/// (u32 is always non-negative, so this always succeeds)
pub fn validate_non_negative_outcomes(_count: u32) -> Result<(), String> {
    Ok(())  // u32 is always >= 0
}

/// Validate a budget threshold (0-100).
pub fn validate_threshold_percent(percent: u32) -> Result<(), String> {
    if percent > 100 {
        Err("Threshold percent cannot exceed 100".to_string())
    } else {
        Ok(())
    }
}

/// Validate a percentage value (0-100).
pub fn validate_percentage(value: Decimal) -> Result<(), String> {
    if value < Decimal::ZERO {
        Err("Percentage cannot be negative".to_string())
    } else if value > Decimal::new(100, 0) {
        Err("Percentage cannot exceed 100".to_string())
    } else {
        Ok(())
    }
}

/// Validate an email address (basic check).
pub fn validate_email(email: &str) -> Result<(), String> {
    if email.trim().is_empty() {
        return Err("Email cannot be empty".to_string());
    }
    if !email.contains('@') {
        return Err("Email must contain @".to_string());
    }
    if email.len() > 254 {
        return Err("Email is too long".to_string());
    }
    Ok(())
}

/// Validate pipeline name.
pub fn validate_pipeline_name(name: &str) -> Result<(), String> {
    validate_non_empty_string(name, "Pipeline name")?;
    validate_string_length(name, "Pipeline name", 1, 255)?;
    Ok(())
}

/// Validate that period is valid (end > start).
pub fn validate_period(start_ts: i64, end_ts: i64) -> Result<(), String> {
    if end_ts <= start_ts {
        Err("End time must be after start time".to_string())
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ============= COST VALIDATION TESTS =============

    #[test]
    fn test_validate_non_negative_cost_valid() {
        let cost = Money::from_cents(100);
        assert!(validate_non_negative_cost(cost).is_ok());
    }

    #[test]
    fn test_validate_non_negative_cost_zero() {
        let cost = Money::from_cents(0);
        assert!(validate_non_negative_cost(cost).is_ok());
    }

    #[test]
    fn test_validate_non_negative_cost_invalid() {
        let cost = Money::new(Decimal::new(-100, 2));
        assert!(validate_non_negative_cost(cost).is_err());
    }

    #[test]
    fn test_validate_positive_cost_valid() {
        let cost = Money::from_cents(100);
        assert!(validate_positive_cost(cost).is_ok());
    }

    #[test]
    fn test_validate_positive_cost_zero() {
        let cost = Money::from_cents(0);
        assert!(validate_positive_cost(cost).is_err());
    }

    #[test]
    fn test_validate_positive_cost_negative() {
        let cost = Money::new(Decimal::new(-100, 2));
        assert!(validate_positive_cost(cost).is_err());
    }

    // ============= STRING VALIDATION TESTS =============

    #[test]
    fn test_validate_non_empty_string_valid() {
        assert!(validate_non_empty_string("Test", "field").is_ok());
    }

    #[test]
    fn test_validate_non_empty_string_empty() {
        assert!(validate_non_empty_string("", "field").is_err());
    }

    #[test]
    fn test_validate_non_empty_string_whitespace() {
        assert!(validate_non_empty_string("   ", "field").is_err());
    }

    #[test]
    fn test_validate_string_length_valid() {
        assert!(validate_string_length("test", "field", 1, 100).is_ok());
    }

    #[test]
    fn test_validate_string_length_too_short() {
        assert!(validate_string_length("x", "field", 2, 100).is_err());
    }

    #[test]
    fn test_validate_string_length_too_long() {
        let long_str = "x".repeat(101);
        assert!(validate_string_length(&long_str, "field", 1, 100).is_err());
    }

    // ============= OUTCOMES VALIDATION TESTS =============

    #[test]
    fn test_validate_positive_outcomes_valid() {
        assert!(validate_positive_outcomes(5).is_ok());
        assert!(validate_positive_outcomes(1).is_ok());
        assert!(validate_positive_outcomes(1000).is_ok());
    }

    #[test]
    fn test_validate_positive_outcomes_zero() {
        assert!(validate_positive_outcomes(0).is_err());
    }

    #[test]
    fn test_validate_non_negative_outcomes() {
        assert!(validate_non_negative_outcomes(0).is_ok());
        assert!(validate_non_negative_outcomes(5).is_ok());
    }

    // ============= PERCENTAGE VALIDATION TESTS =============

    #[test]
    fn test_validate_threshold_percent_valid() {
        assert!(validate_threshold_percent(0).is_ok());
        assert!(validate_threshold_percent(50).is_ok());
        assert!(validate_threshold_percent(100).is_ok());
    }

    #[test]
    fn test_validate_threshold_percent_too_high() {
        assert!(validate_threshold_percent(101).is_err());
        assert!(validate_threshold_percent(200).is_err());
    }

    #[test]
    fn test_validate_percentage_valid() {
        assert!(validate_percentage(Decimal::new(0, 0)).is_ok());
        assert!(validate_percentage(Decimal::new(5000, 2)).is_ok());
        assert!(validate_percentage(Decimal::new(10000, 2)).is_ok());
    }

    #[test]
    fn test_validate_percentage_negative() {
        assert!(validate_percentage(Decimal::new(-100, 2)).is_err());
    }

    #[test]
    fn test_validate_percentage_too_high() {
        assert!(validate_percentage(Decimal::new(10001, 2)).is_err());
    }

    // ============= EMAIL VALIDATION TESTS =============

    #[test]
    fn test_validate_email_valid() {
        assert!(validate_email("user@example.com").is_ok());
        assert!(validate_email("test.user@company.co.uk").is_ok());
    }

    #[test]
    fn test_validate_email_empty() {
        assert!(validate_email("").is_err());
        assert!(validate_email("   ").is_err());
    }

    #[test]
    fn test_validate_email_no_at() {
        assert!(validate_email("userexample.com").is_err());
    }

    #[test]
    fn test_validate_email_too_long() {
        let long_email = format!("{}@example.com", "a".repeat(255));
        assert!(validate_email(&long_email).is_err());
    }

    // ============= PIPELINE NAME VALIDATION TESTS =============

    #[test]
    fn test_validate_pipeline_name_valid() {
        assert!(validate_pipeline_name("Support Bot").is_ok());
        assert!(validate_pipeline_name("Code Generator v2").is_ok());
    }

    #[test]
    fn test_validate_pipeline_name_empty() {
        assert!(validate_pipeline_name("").is_err());
    }

    #[test]
    fn test_validate_pipeline_name_too_long() {
        let long_name = "A".repeat(256);
        assert!(validate_pipeline_name(&long_name).is_err());
    }

    // ============= PERIOD VALIDATION TESTS =============

    #[test]
    fn test_validate_period_valid() {
        assert!(validate_period(1000, 2000).is_ok());
    }

    #[test]
    fn test_validate_period_equal() {
        assert!(validate_period(1000, 1000).is_err());
    }

    #[test]
    fn test_validate_period_reversed() {
        assert!(validate_period(2000, 1000).is_err());
    }
}
