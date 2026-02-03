/**
 * Type definitions for the OdeTest application
 * @category Types
 */

/**
 * Configuration options for the Calculator
 * @public
 */
export interface CalculatorOptions {
  /** Number of decimal places for results */
  precision?: number
  /** Whether to enable detailed logging */
  enableLogging?: boolean
  /** Maximum value allowed in calculations */
  maxValue?: number
}

/**
 * Supported mathematical operations
 * @public
 */
export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt'

/**
 * Result of a mathematical operation
 * @public
 */
export interface CalculationResult {
  /** The computed result */
  value: number
  /** The operation that was performed */
  operation: MathOperation
  /** Input operands used */
  operands: number[]
  /** Timestamp of when the calculation was performed */
  timestamp: Date
}

/**
 * Error information for failed calculations
 * @public
 */
export interface CalculationError {
  /** Error message describing what went wrong */
  message: string
  /** The operation that failed */
  operation: MathOperation
  /** Input values that caused the error */
  input: number[]
}
