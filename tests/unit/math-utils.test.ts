/**
 * @fileoverview Unit tests for MathUtils
 */

import { describe, expect, it } from 'vitest'
import { MathUtils } from '@/utils/math-utils.js'

describe('MathUtils', () => {
  describe('round', () => {
    it('should round to 2 decimal places by default', () => {
      expect(MathUtils.round(3.14159)).toBe(3.14)
      expect(MathUtils.round(2.99999)).toBe(3)
    })

    it('should round to specified decimal places', () => {
      expect(MathUtils.round(3.14159, 3)).toBe(3.142)
      expect(MathUtils.round(3.14159, 0)).toBe(3)
      expect(MathUtils.round(3.14159, 1)).toBe(3.1)
    })

    it('should handle negative numbers', () => {
      expect(MathUtils.round(-3.14159, 2)).toBe(-3.14)
      expect(MathUtils.round(-2.99999, 0)).toBe(-3)
    })
  })

  describe('isSafeNumber', () => {
    it('should return true for safe numbers', () => {
      expect(MathUtils.isSafeNumber(42)).toBe(true)
      expect(MathUtils.isSafeNumber(0)).toBe(true)
      expect(MathUtils.isSafeNumber(-123.45)).toBe(true)
    })

    it('should return false for unsafe numbers', () => {
      expect(MathUtils.isSafeNumber(NaN)).toBe(false)
      expect(MathUtils.isSafeNumber(Infinity)).toBe(false)
      expect(MathUtils.isSafeNumber(-Infinity)).toBe(false)
    })

    it('should respect custom max value', () => {
      expect(MathUtils.isSafeNumber(100, 50)).toBe(false)
      expect(MathUtils.isSafeNumber(50, 50)).toBe(true)
      expect(MathUtils.isSafeNumber(-100, 50)).toBe(false)
    })
  })

  describe('validateNumbers', () => {
    it('should not throw for valid numbers', () => {
      expect(() => MathUtils.validateNumbers([1, 2, 3])).not.toThrow()
      expect(() => MathUtils.validateNumbers([0, -1, 42.5])).not.toThrow()
    })

    it('should throw for invalid numbers', () => {
      expect(() => MathUtils.validateNumbers([1, NaN, 3])).toThrow('Invalid number: NaN')
      expect(() => MathUtils.validateNumbers([Infinity])).toThrow('Invalid number: Infinity')
    })

    it('should respect custom max value', () => {
      expect(() => MathUtils.validateNumbers([100], 50)).toThrow('Invalid number: 100')
      expect(() => MathUtils.validateNumbers([50], 50)).not.toThrow()
    })
  })

  describe('gcd', () => {
    it('should calculate greatest common divisor correctly', () => {
      expect(MathUtils.gcd(12, 18)).toBe(6)
      expect(MathUtils.gcd(17, 13)).toBe(1)
      expect(MathUtils.gcd(0, 5)).toBe(5)
      expect(MathUtils.gcd(100, 25)).toBe(25)
    })

    it('should handle negative numbers', () => {
      expect(MathUtils.gcd(-12, 18)).toBe(6)
      expect(MathUtils.gcd(12, -18)).toBe(6)
      expect(MathUtils.gcd(-12, -18)).toBe(6)
    })
  })

  describe('lcm', () => {
    it('should calculate least common multiple correctly', () => {
      expect(MathUtils.lcm(4, 6)).toBe(12)
      expect(MathUtils.lcm(3, 5)).toBe(15)
      expect(MathUtils.lcm(12, 18)).toBe(36)
    })

    it('should handle cases where one number is multiple of another', () => {
      expect(MathUtils.lcm(3, 9)).toBe(9)
      expect(MathUtils.lcm(5, 25)).toBe(25)
    })
  })
})
