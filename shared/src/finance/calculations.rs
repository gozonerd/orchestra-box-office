//! Financial calculations: ROI, cost-per-outcome, utilization, etc.

use rust_decimal::Decimal;
use crate::finance::Money;

/// Calculate return on investment (ROI) as a percentage.
///
/// ROI = (Gain / Cost) × 100
/// Returns None if cost is zero.
pub fn calculate_roi(gain: Money, cost: Money) -> Option<Decimal> {
    if cost.is_zero() {
        return None;
    }
    Some((gain.0 / cost.0) * Decimal::new(100, 0))
}

/// Calculate cost per business outcome.
///
/// Cost per outcome = Total cost / Number of outcomes
/// Returns None if outcome_count is zero.
pub fn cost_per_outcome(total_cost: Money, outcome_count: u32) -> Option<Money> {
    if outcome_count == 0 {
        return None;
    }
    Some(Money(total_cost.0 / Decimal::new(outcome_count as i64, 0)))
}

/// Calculate license utilization percentage.
///
/// Utilization = (Used / Allocated) × 100
pub fn license_utilization(used: u32, allocated: u32) -> Option<Decimal> {
    if allocated == 0 {
        return None;
    }
    let percent = (Decimal::new(used as i64, 0) / Decimal::new(allocated as i64, 0))
        * Decimal::new(100, 0);
    Some(percent)
}

/// Calculate total cost of inaction (avoided cost through automation).
pub fn cost_of_inaction(manual_hourly_rate: Money, hours_saved: Decimal) -> Money {
    Money(manual_hourly_rate.0 * hours_saved)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_roi_positive() {
        let gain = Money::from_cents(50000);  // $500
        let cost = Money::from_cents(10000);  // $100
        let roi = calculate_roi(gain, cost).unwrap();
        assert_eq!(roi, Decimal::new(50000, 2)); // 500.00 (500%)
    }

    #[test]
    fn test_calculate_roi_zero_cost() {
        let gain = Money::from_cents(10000);
        let cost = Money::from_cents(0);
        assert!(calculate_roi(gain, cost).is_none());
    }

    #[test]
    fn test_cost_per_outcome() {
        let cost = Money::from_cents(100000);  // $1000
        let outcomes = 5;
        let per_outcome = cost_per_outcome(cost, outcomes).unwrap();
        assert_eq!(per_outcome, Money::from_cents(20000)); // $200
    }

    #[test]
    fn test_cost_per_outcome_zero_outcomes() {
        let cost = Money::from_cents(10000);
        assert!(cost_per_outcome(cost, 0).is_none());
    }

    #[test]
    fn test_license_utilization() {
        let util = license_utilization(50, 100).unwrap();
        assert_eq!(util, Decimal::new(5000, 2)); // 50.00%
    }

    #[test]
    fn test_license_utilization_full() {
        let util = license_utilization(100, 100).unwrap();
        assert_eq!(util, Decimal::new(10000, 2)); // 100.00%
    }

    #[test]
    fn test_license_utilization_zero_allocated() {
        assert!(license_utilization(10, 0).is_none());
    }

    #[test]
    fn test_cost_of_inaction() {
        let hourly_rate = Money::from_cents(5000);  // $50/hr
        let hours = Decimal::new(40, 0);  // 40 hours
        let cost = cost_of_inaction(hourly_rate, hours);
        assert_eq!(cost, Money::from_cents(200000)); // $2000
    }
}
