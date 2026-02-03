/**
 * Mathematical utility functions
 * @category Utilities
 */

/**
 * Utility class providing mathematical operations and helpers
 * @public
 */
export class MathUtils {
  /**
   * Rounds a number to the specified number of decimal places
   * @param value - The number to round
   * @param precision - Number of decimal places (default: 2)
   * @returns The rounded number
   * @example
   * ```typescript
   * MathUtils.round(3.14159, 2) // returns 3.14
   * ```
   */
  public static round(value: number, precision = 2): number {
    const factor = Math.pow(10, precision)
    return Math.round(value * factor) / factor
  }

  /**
   * Checks if a number is within a safe range for calculations
   * @param value - The number to check
   * @param maxValue - Maximum allowed value (default: Number.MAX_SAFE_INTEGER)
   * @returns True if the value is safe to use
   */
  public static isSafeNumber(value: number, maxValue = Number.MAX_SAFE_INTEGER): boolean {
    return Number.isFinite(value) && !Number.isNaN(value) && Math.abs(value) <= maxValue
  }

  /**
   * Validates that all provided numbers are safe for calculations
   * @param values - Array of numbers to validate
   * @param maxValue - Maximum allowed value
   * @throws Error if any value is unsafe
   */
  public static validateNumbers(values: number[], maxValue?: number): void {
    for (const value of values) {
      if (!this.isSafeNumber(value, maxValue)) {
        throw new Error(`Invalid number: ${value}. Must be finite and within safe range.`)
      }
    }
  }

  /**
   * Calculates the greatest common divisor of two numbers
   * @param a - First number
   * @param b - Second number
   * @returns The GCD of a and b
   */
  public static gcd(a: number, b: number): number {
    a = Math.abs(Math.floor(a))
    b = Math.abs(Math.floor(b))

    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }

    return a
  }

  /**
   * Calculates the least common multiple of two numbers
   * @param a - First number
   * @param b - Second number
   * @returns The LCM of a and b
   */
  public static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b)
  }
}
