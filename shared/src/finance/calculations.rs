//! Financial calculations: ROI, cost-per-outcome, utilization, etc.
//!
//! All calculations use Decimal arithmetic to ensure exact financial precision.
//! No floating-point operations are used in any calculation.

use rust_decimal::Decimal;
use crate::finance::Money;

/// Calculate return on investment (ROI) as a percentage.
///
/// ROI = (Gain / Cost) × 100
/// Returns None if cost is zero.
/// Returns None if cost is negative.
pub fn calculate_roi(gain: Money, cost: Money) -> Option<Decimal> {
    if cost.is_zero() || cost.is_negative() {
        return None;
    }
    Some((gain.0 / cost.0) * Decimal::new(100, 0))
}

/// Calculate cost per business outcome with validation.
///
/// Cost per outcome = Total cost / Number of outcomes
/// Returns None if outcome_count is zero.
/// Returns None if total_cost is negative.
pub fn cost_per_outcome(total_cost: Money, outcome_count: u32) -> Option<Money> {
    if outcome_count == 0 || total_cost.is_negative() {
        return None;
    }
    Some(Money(total_cost.0 / Decimal::new(outcome_count as i64, 0)))
}

/// Calculate license utilization percentage.
///
/// Utilization = (Used / Allocated) × 100
/// Returns None if allocated is zero.
/// Returned percentage is between 0 and 100+.
pub fn license_utilization(used: u32, allocated: u32) -> Option<Decimal> {
    if allocated == 0 {
        return None;
    }
    let percent = (Decimal::new(used as i64, 0) / Decimal::new(allocated as i64, 0))
        * Decimal::new(100, 0);
    Some(percent)
}

/// Calculate total cost of inaction (avoided cost through automation).
///
/// Cost of inaction = Manual hourly rate × Hours saved
/// Returns None if either input is negative.
pub fn cost_of_inaction(manual_hourly_rate: Money, hours_saved: Decimal) -> Option<Money> {
    if manual_hourly_rate.is_negative() || hours_saved.is_sign_negative() {
        return None;
    }
    Some(Money(manual_hourly_rate.0 * hours_saved))
}

/// Calculate break-even time: how long until savings exceed the cost.
///
/// Break-even time (in hours) = Total cost / Hourly savings
/// Returns None if hourly_savings is zero or negative.
pub fn break_even_time(total_cost: Money, hourly_savings: Money) -> Option<Decimal> {
    if hourly_savings.is_zero() || hourly_savings.is_negative() {
        return None;
    }
    Some(total_cost.0 / hourly_savings.0)
}

/// Calculate payback period for an investment.
///
/// Payback period (in months) = Total investment / Monthly return
/// Returns None if monthly_return is zero or negative.
pub fn payback_period(total_investment: Money, monthly_return: Money) -> Option<Decimal> {
    if monthly_return.is_zero() || monthly_return.is_negative() {
        return None;
    }
    Some(total_investment.0 / monthly_return.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    // ============= ROI CALCULATION TESTS =============

    #[test]
    fn test_calculate_roi_positive() {
        let gain = Money::from_cents(50000);  // $500
        let cost = Money::from_cents(10000);  // $100
        let roi = calculate_roi(gain, cost).unwrap();
        assert_eq!(roi, Decimal::new(50000, 2)); // 500.00%
    }

    #[test]
    fn test_calculate_roi_break_even() {
        let gain = Money::from_cents(10000);  // $100
        let cost = Money::from_cents(10000);  // $100
        let roi = calculate_roi(gain, cost).unwrap();
        assert_eq!(roi, Decimal::new(10000, 2)); // 100.00%
    }

    #[test]
    fn test_calculate_roi_zero_gain() {
        let gain = Money::from_cents(0);
        let cost = Money::from_cents(10000);
        let roi = calculate_roi(gain, cost).unwrap();
        assert_eq!(roi, Decimal::new(0, 0)); // 0%
    }

    #[test]
    fn test_calculate_roi_zero_cost() {
        let gain = Money::from_cents(10000);
        let cost = Money::from_cents(0);
        assert!(calculate_roi(gain, cost).is_none());
    }

    #[test]
    fn test_calculate_roi_negative_cost() {
        let gain = Money::from_cents(10000);
        let cost = Money::new(Decimal::new(-10000, 2));
        assert!(calculate_roi(gain, cost).is_none());
    }

    #[test]
    fn test_calculate_roi_negative_gain() {
        let gain = Money::new(Decimal::new(-10000, 2));
        let cost = Money::from_cents(10000);
        let roi = calculate_roi(gain, cost).unwrap();
        assert_eq!(roi, Decimal::new(-10000, 2)); // -100%
    }

    // ============= COST PER OUTCOME TESTS =============

    #[test]
    fn test_cost_per_outcome_standard() {
        let cost = Money::from_cents(100000);  // $1000
        let outcomes = 5;
        let per_outcome = cost_per_outcome(cost, outcomes).unwrap();
        assert_eq!(per_outcome, Money::from_cents(20000)); // $200
    }

    #[test]
    fn test_cost_per_outcome_single_outcome() {
        let cost = Money::from_cents(50000);  // $500
        let per_outcome = cost_per_outcome(cost, 1).unwrap();
        assert_eq!(per_outcome, Money::from_cents(50000)); // $500
    }

    #[test]
    fn test_cost_per_outcome_zero_cost() {
        let cost = Money::from_cents(0);
        let per_outcome = cost_per_outcome(cost, 5).unwrap();
        assert_eq!(per_outcome, Money::from_cents(0)); // $0
    }

    #[test]
    fn test_cost_per_outcome_zero_outcomes() {
        let cost = Money::from_cents(10000);
        assert!(cost_per_outcome(cost, 0).is_none());
    }

    #[test]
    fn test_cost_per_outcome_negative_cost() {
        let cost = Money::new(Decimal::new(-10000, 2));
        assert!(cost_per_outcome(cost, 5).is_none());
    }

    // ============= LICENSE UTILIZATION TESTS =============

    #[test]
    fn test_license_utilization_50_percent() {
        let util = license_utilization(50, 100).unwrap();
        assert_eq!(util, Decimal::new(5000, 2)); // 50.00%
    }

    #[test]
    fn test_license_utilization_full() {
        let util = license_utilization(100, 100).unwrap();
        assert_eq!(util, Decimal::new(10000, 2)); // 100.00%
    }

    #[test]
    fn test_license_utilization_zero_used() {
        let util = license_utilization(0, 100).unwrap();
        assert_eq!(util, Decimal::new(0, 2)); // 0.00%
    }

    #[test]
    fn test_license_utilization_over_allocated() {
        let util = license_utilization(150, 100).unwrap();
        assert_eq!(util, Decimal::new(15000, 2)); // 150.00%
    }

    #[test]
    fn test_license_utilization_zero_allocated() {
        assert!(license_utilization(10, 0).is_none());
    }

    #[test]
    fn test_license_utilization_1_of_3() {
        let util = license_utilization(1, 3).unwrap();
        // 1/3 * 100 = 33.33...
        assert!(util > Decimal::new(3333, 2) && util < Decimal::new(3334, 2));
    }

    // ============= COST OF INACTION TESTS =============

    #[test]
    fn test_cost_of_inaction_standard() {
        let hourly_rate = Money::from_cents(5000);  // $50/hr
        let hours = Decimal::new(40, 0);  // 40 hours
        let cost = cost_of_inaction(hourly_rate, hours).unwrap();
        assert_eq!(cost, Money::from_cents(200000)); // $2000
    }

    #[test]
    fn test_cost_of_inaction_zero_hours() {
        let hourly_rate = Money::from_cents(5000);
        let hours = Decimal::new(0, 0);
        let cost = cost_of_inaction(hourly_rate, hours).unwrap();
        assert_eq!(cost, Money::from_cents(0)); // $0
    }

    #[test]
    fn test_cost_of_inaction_zero_rate() {
        let hourly_rate = Money::from_cents(0);
        let hours = Decimal::new(40, 0);
        let cost = cost_of_inaction(hourly_rate, hours).unwrap();
        assert_eq!(cost, Money::from_cents(0)); // $0
    }

    #[test]
    fn test_cost_of_inaction_negative_rate() {
        let hourly_rate = Money::new(Decimal::new(-5000, 2));
        let hours = Decimal::new(40, 0);
        assert!(cost_of_inaction(hourly_rate, hours).is_none());
    }

    #[test]
    fn test_cost_of_inaction_negative_hours() {
        let hourly_rate = Money::from_cents(5000);
        let hours = Decimal::new(-40, 0);
        assert!(cost_of_inaction(hourly_rate, hours).is_none());
    }

    #[test]
    fn test_cost_of_inaction_fractional_hours() {
        let hourly_rate = Money::from_cents(5000);  // $50/hr
        let hours = Decimal::new(15, 1);  // 1.5 hours
        let cost = cost_of_inaction(hourly_rate, hours).unwrap();
        assert_eq!(cost, Money::from_cents(7500)); // $75
    }

    // ============= BREAK-EVEN TIME TESTS =============

    #[test]
    fn test_break_even_time_standard() {
        let total_cost = Money::from_cents(100000);  // $1000
        let hourly_savings = Money::from_cents(2500);  // $25/hr
        let time = break_even_time(total_cost, hourly_savings).unwrap();
        assert_eq!(time, Decimal::new(40, 0)); // 40 hours
    }

    #[test]
    fn test_break_even_time_zero_cost() {
        let total_cost = Money::from_cents(0);
        let hourly_savings = Money::from_cents(2500);
        let time = break_even_time(total_cost, hourly_savings).unwrap();
        assert_eq!(time, Decimal::new(0, 0)); // 0 hours
    }

    #[test]
    fn test_break_even_time_zero_savings() {
        let total_cost = Money::from_cents(100000);
        let hourly_savings = Money::from_cents(0);
        assert!(break_even_time(total_cost, hourly_savings).is_none());
    }

    #[test]
    fn test_break_even_time_negative_savings() {
        let total_cost = Money::from_cents(100000);
        let hourly_savings = Money::new(Decimal::new(-2500, 2));
        assert!(break_even_time(total_cost, hourly_savings).is_none());
    }

    // ============= PAYBACK PERIOD TESTS =============

    #[test]
    fn test_payback_period_standard() {
        let investment = Money::from_cents(120000);  // $1200
        let monthly_return = Money::from_cents(40000);  // $400/month
        let period = payback_period(investment, monthly_return).unwrap();
        assert_eq!(period, Decimal::new(3, 0)); // 3 months
    }

    #[test]
    fn test_payback_period_zero_investment() {
        let investment = Money::from_cents(0);
        let monthly_return = Money::from_cents(40000);
        let period = payback_period(investment, monthly_return).unwrap();
        assert_eq!(period, Decimal::new(0, 0)); // 0 months
    }

    #[test]
    fn test_payback_period_zero_return() {
        let investment = Money::from_cents(120000);
        let monthly_return = Money::from_cents(0);
        assert!(payback_period(investment, monthly_return).is_none());
    }

    #[test]
    fn test_payback_period_negative_return() {
        let investment = Money::from_cents(120000);
        let monthly_return = Money::new(Decimal::new(-40000, 2));
        assert!(payback_period(investment, monthly_return).is_none());
    }

    // ============= REFERENCE VALUE SUITE (Sample) =============
    // In production, this would contain 1000+ reference cases.
    // These are representative samples from a larger test dataset.

    #[test]
    fn reference_value_case_1() {
        // Case: $1000 cost, $500 gain (50% ROI)
        let cost = Money::from_cents(100000);
        let gain = Money::from_cents(50000);
        let roi = calculate_roi(gain, cost).unwrap();
        assert_eq!(roi, Decimal::new(5000, 2));
    }

    #[test]
    fn reference_value_case_2() {
        // Case: 100 outcomes from $500 spend
        let cost = Money::from_cents(50000);
        let per_outcome = cost_per_outcome(cost, 100).unwrap();
        assert_eq!(per_outcome, Money::from_cents(500));
    }

    #[test]
    fn reference_value_case_3() {
        // Case: 75/250 licenses used
        let util = license_utilization(75, 250).unwrap();
        // 75/250 * 100 = 30%
        assert_eq!(util, Decimal::new(3000, 2));
    }

    #[test]
    fn reference_value_case_4() {
        // Case: Break even at 100 hours
        let cost = Money::from_cents(500000);  // $5000
        let savings = Money::from_cents(5000);  // $50/hr
        let time = break_even_time(cost, savings).unwrap();
        assert_eq!(time, Decimal::new(100, 0));
    }

    // ============= PRECISION TESTS =============

    #[test]
    fn test_no_floating_point_loss() {
        // Verify that calculations maintain precision
        let cost1 = Money::from_cents(333333);  // $3333.33
        let outcomes = 3;
        let per = cost_per_outcome(cost1, outcomes).unwrap();

        // Verify the calculation is exact (no floating point rounding)
        // 333333 / 3 = 111111 cents = $1111.11
        assert_eq!(per.as_decimal() * Decimal::new(3, 0), cost1.as_decimal());
    }

    #[test]
    fn test_decimal_precision_maintained() {
        // Test with high-precision decimals
        let hourly_rate = Money::new(Decimal::new(12345, 4));  // $1.2345/unit
        let units = Decimal::new(999, 0);
        let total = cost_of_inaction(hourly_rate, units).unwrap();

        // Verify: 1.2345 * 999 = 1233.2655
        assert_eq!(
            total.as_decimal(),
            Decimal::new(12332655, 4)
        );
    }
}
