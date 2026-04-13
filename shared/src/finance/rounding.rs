//! Rounding strategies: Banker's rounding (round-half-to-even) for financial accuracy.

use rust_decimal::Decimal;

/// Round using Banker's rounding (round-half-to-even).
/// This is the standard for financial calculations to minimize rounding bias.
pub fn banker_round(value: Decimal, places: u32) -> Decimal {
    // rust_decimal's round_dp uses round-half-up by default.
    // For true banker's rounding, we implement it manually.
    let factor = Decimal::new(10_i64.pow(places), 0);
    let scaled = value * factor;
    let rounded = scaled.round();
    rounded / factor
}

/// Round to cents (2 decimal places) using Banker's rounding.
pub fn round_to_cents(value: Decimal) -> Decimal {
    banker_round(value, 2)
}

/// Round to dollars (0 decimal places) using Banker's rounding.
pub fn round_to_dollars(value: Decimal) -> Decimal {
    banker_round(value, 0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_banker_round_half_even() {
        // 1.5 rounds to 2 (to even)
        let val = Decimal::new(15, 1);
        assert_eq!(banker_round(val, 0), Decimal::new(2, 0));

        // 2.5 rounds to 2 (to even)
        let val = Decimal::new(25, 1);
        assert_eq!(banker_round(val, 0), Decimal::new(2, 0));
    }

    #[test]
    fn test_round_to_cents() {
        let val = Decimal::new(12345, 3);  // 12.345
        assert_eq!(round_to_cents(val), Decimal::new(1234, 2)); // 12.34
    }

    #[test]
    fn test_round_to_dollars() {
        let val = Decimal::new(12549, 2);  // 125.49
        assert_eq!(round_to_dollars(val), Decimal::new(125, 0)); // 125
    }
}
