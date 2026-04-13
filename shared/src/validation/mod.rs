//! Input validation for all entities.

use crate::finance::Money;

/// Validate that a cost is non-negative.
pub fn validate_non_negative_cost(cost: Money) -> Result<(), String> {
    if cost.is_negative() {
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

/// Validate that outcomes count is positive.
pub fn validate_positive_outcomes(count: u32) -> Result<(), String> {
    if count == 0 {
        Err("Outcomes count must be positive".to_string())
    } else {
        Ok(())
    }
}

/// Validate a budget threshold (0-100).
pub fn validate_threshold_percent(percent: u32) -> Result<(), String> {
    if percent > 100 {
        Err("Threshold percent cannot exceed 100".to_string())
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_non_negative_cost_valid() {
        let cost = Money::from_cents(100);
        assert!(validate_non_negative_cost(cost).is_ok());
    }

    #[test]
    fn test_validate_non_negative_cost_invalid() {
        let cost = Money::new(rust_decimal::Decimal::new(-100, 2));
        assert!(validate_non_negative_cost(cost).is_err());
    }

    #[test]
    fn test_validate_non_empty_string_valid() {
        assert!(validate_non_empty_string("Test", "field").is_ok());
    }

    #[test]
    fn test_validate_non_empty_string_invalid() {
        assert!(validate_non_empty_string("", "field").is_err());
        assert!(validate_non_empty_string("   ", "field").is_err());
    }

    #[test]
    fn test_validate_positive_outcomes_valid() {
        assert!(validate_positive_outcomes(5).is_ok());
    }

    #[test]
    fn test_validate_positive_outcomes_invalid() {
        assert!(validate_positive_outcomes(0).is_err());
    }

    #[test]
    fn test_validate_threshold_percent_valid() {
        assert!(validate_threshold_percent(80).is_ok());
        assert!(validate_threshold_percent(100).is_ok());
        assert!(validate_threshold_percent(0).is_ok());
    }

    #[test]
    fn test_validate_threshold_percent_invalid() {
        assert!(validate_threshold_percent(101).is_err());
    }
}
