/**
 * @fileoverview Unit tests for Calculator
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { Calculator } from '@/components/calculator.js'

describe('Calculator', () => {
  let calculator: Calculator

  beforeEach(() => {
    calculator = new Calculator()
  })

  describe('constructor', () => {
    it('should create calculator with default options', () => {
      const calc = new Calculator()
      const options = calc.getOptions()

      expect(options.precision).toBe(2)
      expect(options.enableLogging).toBe(false)
      expect(options.maxValue).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should create calculator with custom options', () => {
      const calc = new Calculator({
        precision: 3,
        enableLogging: true,
        maxValue: 1000,
      })
      const options = calc.getOptions()

      expect(options.precision).toBe(3)
      expect(options.enableLogging).toBe(true)
      expect(options.maxValue).toBe(1000)
    })
  })

  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(calculator.add(2, 3)).toBe(5)
      expect(calculator.add(0, 0)).toBe(0)
      expect(calculator.add(-1, 1)).toBe(0)
    })

    it('should add multiple numbers', () => {
      expect(calculator.add(1, 2, 3, 4)).toBe(10)
      expect(calculator.add(-1, -2, -3)).toBe(-6)
    })

    it('should round result to configured precision', () => {
      const calc = new Calculator({ precision: 1 })
      expect(calc.add(1.11, 2.22)).toBe(3.3)
    })

    it('should throw error for insufficient operands', () => {
      expect(() => calculator.add()).toThrow('At least 2 operand(s) required')
      expect(() => calculator.add(1)).toThrow('At least 2 operand(s) required')
    })
  })

  describe('subtract', () => {
    it('should subtract correctly', () => {
      expect(calculator.subtract(5, 3)).toBe(2)
      expect(calculator.subtract(0, 5)).toBe(-5)
      expect(calculator.subtract(-3, -1)).toBe(-2)
    })
  })

  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      expect(calculator.multiply(3, 4)).toBe(12)
      expect(calculator.multiply(-2, 3)).toBe(-6)
      expect(calculator.multiply(0, 100)).toBe(0)
    })

    it('should multiply multiple numbers', () => {
      expect(calculator.multiply(2, 3, 4)).toBe(24)
      expect(calculator.multiply(-1, 2, 3)).toBe(-6)
    })
  })

  describe('divide', () => {
    it('should divide correctly', () => {
      expect(calculator.divide(10, 2)).toBe(5)
      expect(calculator.divide(-6, 3)).toBe(-2)
      expect(calculator.divide(7, 2)).toBe(3.5)
    })

    it('should throw error for division by zero', () => {
      expect(() => calculator.divide(5, 0)).toThrow('Division by zero is not allowed')
    })
  })

  describe('power', () => {
    it('should calculate power correctly', () => {
      expect(calculator.power(2, 3)).toBe(8)
      expect(calculator.power(5, 0)).toBe(1)
      expect(calculator.power(3, 2)).toBe(9)
    })

    it('should handle negative exponents', () => {
      expect(calculator.power(2, -2)).toBe(0.25)
    })
  })

  describe('sqrt', () => {
    it('should calculate square root correctly', () => {
      expect(calculator.sqrt(9)).toBe(3)
      expect(calculator.sqrt(16)).toBe(4)
      expect(calculator.sqrt(0)).toBe(0)
    })

    it('should throw error for negative numbers', () => {
      expect(() => calculator.sqrt(-4)).toThrow('Cannot calculate square root of negative number')
    })
  })

  describe('history', () => {
    it('should track calculation history', () => {
      calculator.add(2, 3)
      calculator.multiply(4, 5)
      const history = calculator.getHistory()
      expect(history).toHaveLength(2)
      expect(history[0]?.operation).toBe('add')
      expect(history[0]?.value).toBe(5)
      expect(history[1]?.operation).toBe('multiply')
      expect(history[1]?.value).toBe(20)
    })

    it('should clear history', () => {
      calculator.add(1, 2)
      calculator.clearHistory()

      expect(calculator.getHistory()).toHaveLength(0)
    })

    it('should include timestamp in history', () => {
      const before = new Date()
      calculator.add(1, 2)
      const after = new Date()
      const history = calculator.getHistory()
      expect(history[0]?.timestamp).toBeInstanceOf(Date)
      expect(history[0]?.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(history[0]?.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('error handling', () => {
    it('should validate operands', () => {
      expect(() => calculator.add(1, NaN)).toThrow('Invalid number: NaN')
      expect(() => calculator.multiply(Infinity, 2)).toThrow('Invalid number: Infinity')
    })

    it('should respect max value limits', () => {
      const calc = new Calculator({ maxValue: 100 })
      expect(() => calc.add(150, 50)).toThrow('Invalid number: 150')
    })
  })
})
