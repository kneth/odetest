/**
 * Calculator component for performing mathematical operations
 * @category Core
 */

import type { CalculationResult, CalculatorOptions, MathOperation } from '@/types/index.js'
import { MathUtils } from '@/utils/math-utils.js'

/**
 * A modern calculator class with comprehensive mathematical operations
 * @public
 */
export class Calculator {
  private readonly options: Required<CalculatorOptions>
  private readonly history: CalculationResult[] = []

  /**
   * Creates a new Calculator instance
   * @param options - Configuration options for the calculator
   */
  constructor(options: CalculatorOptions = {}) {
    this.options = {
      precision: options.precision ?? 2,
      enableLogging: options.enableLogging ?? false,
      maxValue: options.maxValue ?? Number.MAX_SAFE_INTEGER,
    }
  }

  /**
   * Adds two or more numbers
   * @param operands - Numbers to add
   * @returns The sum of all operands
   * @throws Error if operands are invalid or result exceeds safe range
   */
  public add(...operands: number[]): number {
    this.validateOperands(operands, 2)

    const result = operands.reduce((sum, num) => sum + num, 0)
    return this.processResult('add', operands, result)
  }

  /**
   * Subtracts the second number from the first
   * @param minuend - The number to subtract from
   * @param subtrahend - The number to subtract
   * @returns The difference
   */
  public subtract(minuend: number, subtrahend: number): number {
    const operands = [minuend, subtrahend]
    this.validateOperands(operands, 2)

    const result = minuend - subtrahend
    return this.processResult('subtract', operands, result)
  }

  /**
   * Multiplies two or more numbers
   * @param operands - Numbers to multiply
   * @returns The product of all operands
   */
  public multiply(...operands: number[]): number {
    this.validateOperands(operands, 2)

    const result = operands.reduce((product, num) => product * num, 1)
    return this.processResult('multiply', operands, result)
  }

  /**
   * Divides the first number by the second
   * @param dividend - The number to divide
   * @param divisor - The number to divide by
   * @returns The quotient
   * @throws Error if divisor is zero
   */
  public divide(dividend: number, divisor: number): number {
    const operands = [dividend, divisor]
    this.validateOperands(operands, 2)

    if (divisor === 0) {
      throw new Error('Division by zero is not allowed')
    }

    const result = dividend / divisor
    return this.processResult('divide', operands, result)
  }

  /**
   * Raises a number to a power
   * @param base - The base number
   * @param exponent - The exponent
   * @returns The result of base^exponent
   */
  public power(base: number, exponent: number): number {
    const operands = [base, exponent]
    this.validateOperands(operands, 2)

    const result = Math.pow(base, exponent)
    return this.processResult('power', operands, result)
  }

  /**
   * Calculates the square root of a number
   * @param operand - The number to find the square root of
   * @returns The square root
   * @throws Error if operand is negative
   */
  public sqrt(operand: number): number {
    this.validateOperands([operand], 1)

    if (operand < 0) {
      throw new Error('Cannot calculate square root of negative number')
    }

    const result = Math.sqrt(operand)
    return this.processResult('sqrt', [operand], result)
  }

  /**
   * Gets the calculation history
   * @returns Array of all previous calculations
   */
  public getHistory(): readonly CalculationResult[] {
    return [...this.history]
  }

  /**
   * Clears the calculation history
   */
  public clearHistory(): void {
    this.history.length = 0
    this.log('History cleared')
  }

  /**
   * Gets the current calculator options
   * @returns The current configuration
   */
  public getOptions(): Readonly<Required<CalculatorOptions>> {
    return { ...this.options }
  }

  private validateOperands(operands: number[], minCount: number): void {
    if (operands.length < minCount) {
      throw new Error(`At least ${minCount} operand(s) required`)
    }

    MathUtils.validateNumbers(operands, this.options.maxValue)
  }

  private processResult(operation: MathOperation, operands: number[], result: number): number {
    if (!MathUtils.isSafeNumber(result, this.options.maxValue)) {
      throw new Error(`Result ${result} exceeds safe calculation range`)
    }

    const roundedResult = MathUtils.round(result, this.options.precision)

    const calculationResult: CalculationResult = {
      value: roundedResult,
      operation,
      operands: [...operands],
      timestamp: new Date(),
    }

    this.history.push(calculationResult)
    this.log(`${operation}(${operands.join(', ')}) = ${roundedResult}`)

    return roundedResult
  }

  private log(message: string): void {
    if (this.options.enableLogging) {
      // eslint-disable-next-line no-console
      console.log(`[Calculator] ${message}`)
    }
  }
}
