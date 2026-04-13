//! Financial arithmetic module using rust_decimal for exact calculations.
//!
//! All monetary calculations use Decimal (fixed-point) arithmetic to avoid
//! floating-point rounding errors. No conversion to/from float.

use rust_decimal::Decimal;
use std::ops::{Add, Sub, Mul, Div};

pub mod calculations;
pub mod rounding;

pub use calculations::*;
pub use rounding::*;

/// Wrapper for monetary amounts with guaranteed decimal precision.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, serde::Serialize, serde::Deserialize)]
pub struct Money(pub Decimal);

impl Money {
    /// Create a Money value from a Decimal.
    pub fn new(d: Decimal) -> Self {
        Money(d)
    }

    /// Create Money from integer cents (no precision loss).
    pub fn from_cents(cents: i64) -> Self {
        Money(Decimal::new(cents, 2))
    }

    /// Get the value as a Decimal.
    pub fn as_decimal(&self) -> Decimal {
        self.0
    }

    /// Check if the value is negative.
    pub fn is_negative(&self) -> bool {
        self.0.is_sign_negative()
    }

    /// Check if the value is positive (greater than zero).
    pub fn is_positive(&self) -> bool {
        !self.0.is_zero() && self.0.is_sign_positive()
    }

    /// Check if the value is zero.
    pub fn is_zero(&self) -> bool {
        self.0.is_zero()
    }
}

impl Add for Money {
    type Output = Money;
    fn add(self, rhs: Money) -> Money {
        Money(self.0 + rhs.0)
    }
}

impl Sub for Money {
    type Output = Money;
    fn sub(self, rhs: Money) -> Money {
        Money(self.0 - rhs.0)
    }
}

impl Mul<Decimal> for Money {
    type Output = Money;
    fn mul(self, rhs: Decimal) -> Money {
        Money(self.0 * rhs)
    }
}

impl Div<Decimal> for Money {
    type Output = Result<Money, String>;
    fn div(self, rhs: Decimal) -> Result<Money, String> {
        if rhs.is_zero() {
            Err("Division by zero".to_string())
        } else {
            Ok(Money(self.0 / rhs))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ============= MONEY ADDITION TESTS =============

    #[test]
    fn test_money_addition_positive() {
        let a = Money::from_cents(100);
        let b = Money::from_cents(50);
        assert_eq!(a + b, Money::from_cents(150));
    }

    #[test]
    fn test_money_addition_with_negative() {
        let a = Money::from_cents(100);
        let b = Money::new(Decimal::new(-30, 2));
        assert_eq!(a + b, Money::from_cents(70));
    }

    #[test]
    fn test_money_addition_large_numbers() {
        let a = Money::from_cents(9999999);
        let b = Money::from_cents(1);
        assert_eq!(a + b, Money::from_cents(10000000));
    }

    #[test]
    fn test_money_addition_zero() {
        let a = Money::from_cents(100);
        let zero = Money::from_cents(0);
        assert_eq!(a + zero, a);
    }

    // ============= MONEY SUBTRACTION TESTS =============

    #[test]
    fn test_money_subtraction_positive() {
        let a = Money::from_cents(100);
        let b = Money::from_cents(30);
        assert_eq!(a - b, Money::from_cents(70));
    }

    #[test]
    fn test_money_subtraction_result_negative() {
        let a = Money::from_cents(30);
        let b = Money::from_cents(100);
        assert_eq!(a - b, Money::new(Decimal::new(-70, 2)));
    }

    #[test]
    fn test_money_subtraction_zero() {
        let a = Money::from_cents(100);
        let zero = Money::from_cents(0);
        assert_eq!(a - zero, a);
    }

    #[test]
    fn test_money_subtraction_from_itself() {
        let a = Money::from_cents(100);
        assert_eq!(a - a, Money::from_cents(0));
    }

    // ============= MONEY MULTIPLICATION TESTS =============

    #[test]
    fn test_money_multiplication_by_two() {
        let a = Money::from_cents(100);
        let b = Decimal::new(2, 0);
        assert_eq!(a * b, Money::from_cents(200));
    }

    #[test]
    fn test_money_multiplication_by_one() {
        let a = Money::from_cents(100);
        let b = Decimal::new(1, 0);
        assert_eq!(a * b, a);
    }

    #[test]
    fn test_money_multiplication_by_zero() {
        let a = Money::from_cents(100);
        let b = Decimal::new(0, 0);
        assert_eq!(a * b, Money::from_cents(0));
    }

    #[test]
    fn test_money_multiplication_by_fraction() {
        let a = Money::from_cents(100);
        let b = Decimal::new(5, 1);  // 0.5
        assert_eq!(a * b, Money::from_cents(50));
    }

    #[test]
    fn test_money_multiplication_large() {
        let a = Money::from_cents(100000);
        let b = Decimal::new(10, 0);
        assert_eq!(a * b, Money::from_cents(1000000));
    }

    // ============= MONEY DIVISION TESTS =============

    #[test]
    fn test_money_division_by_two() {
        let a = Money::from_cents(100);
        let b = Decimal::new(2, 0);
        let result = (a / b).unwrap();
        assert_eq!(result, Money::from_cents(50));
    }

    #[test]
    fn test_money_division_by_one() {
        let a = Money::from_cents(100);
        let b = Decimal::new(1, 0);
        let result = (a / b).unwrap();
        assert_eq!(result, a);
    }

    #[test]
    fn test_money_division_by_zero() {
        let a = Money::from_cents(100);
        let b = Decimal::new(0, 0);
        assert!((a / b).is_err());
    }

    // ============= MONEY PROPERTIES TESTS =============

    #[test]
    fn test_money_is_zero_true() {
        let zero = Money::from_cents(0);
        assert!(zero.is_zero());
    }

    #[test]
    fn test_money_is_zero_false() {
        let non_zero = Money::from_cents(1);
        assert!(!non_zero.is_zero());
    }

    #[test]
    fn test_money_is_negative_true() {
        let neg = Money::new(Decimal::new(-100, 2));
        assert!(neg.is_negative());
    }

    #[test]
    fn test_money_is_negative_false() {
        let pos = Money::from_cents(100);
        assert!(!pos.is_negative());
    }

    #[test]
    fn test_money_is_positive_true() {
        let pos = Money::from_cents(100);
        assert!(pos.is_positive());
    }

    #[test]
    fn test_money_is_positive_false() {
        let zero = Money::from_cents(0);
        assert!(!zero.is_positive());
    }

    // ============= MONEY CONVERSION TESTS =============

    #[test]
    fn test_money_from_cents() {
        let m = Money::from_cents(12345);
        assert_eq!(m.as_decimal(), Decimal::new(12345, 2));
    }

    #[test]
    fn test_money_new() {
        let d = Decimal::new(12345, 2);
        let m = Money::new(d);
        assert_eq!(m.as_decimal(), d);
    }
}
