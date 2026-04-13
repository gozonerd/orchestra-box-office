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

    /// Check if the value is positive.
    pub fn is_positive(&self) -> bool {
        self.0.is_sign_positive()
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

    #[test]
    fn test_money_addition() {
        let a = Money::from_cents(100);
        let b = Money::from_cents(50);
        assert_eq!(a + b, Money::from_cents(150));
    }

    #[test]
    fn test_money_subtraction() {
        let a = Money::from_cents(100);
        let b = Money::from_cents(30);
        assert_eq!(a - b, Money::from_cents(70));
    }

    #[test]
    fn test_money_multiplication() {
        let a = Money::from_cents(100);
        let b = Decimal::new(2, 0);
        assert_eq!(a * b, Money::from_cents(200));
    }

    #[test]
    fn test_money_is_zero() {
        let zero = Money::from_cents(0);
        assert!(zero.is_zero());
    }

    #[test]
    fn test_money_is_negative() {
        let neg = Money::new(Decimal::new(-100, 2));
        assert!(neg.is_negative());
    }
}
