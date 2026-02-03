/**
 * @fileoverview Unit tests for ODE Solver
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { ODESolver, EquationParser, NumericalMethods } from '@/ode-solver/index.js'

describe('EquationParser', () => {
  let parser: EquationParser

  beforeEach(() => {
    parser = new EquationParser()
  })

  describe('parse', () => {
    it('should parse simple linear equation', () => {
      const parsed = parser.parse('t + y')
      expect(parsed.valid).toBe(true)
      expect(parsed.variables).toEqual(['t', 'y'])
      expect(parsed.evaluate(1, 2)).toBe(3)
    })

    it('should parse trigonometric functions', () => {
      const parsed = parser.parse('sin(t) * y')
      expect(parsed.valid).toBe(true)
      expect(parsed.variables).toEqual(['t', 'y'])
      expect(parsed.evaluate(0, 5)).toBeCloseTo(0, 6)
      expect(parsed.evaluate(Math.PI / 2, 2)).toBeCloseTo(2, 6)
    })

    it('should parse exponential functions', () => {
      const parsed = parser.parse('exp(t) - y')
      expect(parsed.valid).toBe(true)
      expect(parsed.variables).toEqual(['t', 'y'])
      expect(parsed.evaluate(0, 0)).toBeCloseTo(1, 6)
    })

    it('should handle power notation', () => {
      const parsed = parser.parse('t^2 + y^3')
      expect(parsed.valid).toBe(true)
      expect(parsed.evaluate(2, 3)).toBeCloseTo(31, 6) // 4 + 27
    })

    it('should reject invalid variables', () => {
      const parsed = parser.parse('t + z')
      expect(parsed.valid).toBe(false)
      expect(parsed.error).toContain('Invalid variables found: z')
    })

    it('should handle constants', () => {
      const parsed = parser.parse('pi * t + e * y')
      expect(parsed.valid).toBe(true)
      expect(parsed.variables).toEqual(['t', 'y'])
    })

    it('should reject empty expressions', () => {
      const parsed = parser.parse('')
      expect(parsed.valid).toBe(false)
    })
  })

  describe('validateExpression', () => {
    it('should validate safe expressions', () => {
      const result = parser.validateExpression('t + y')
      expect(result.valid).toBe(true)
    })

    it('should reject dangerous expressions', () => {
      const result = parser.validateExpression('eval("malicious code")')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('unsafe')
    })

    it('should reject expressions with function keyword', () => {
      const result = parser.validateExpression('function() { return t + y }')
      expect(result.valid).toBe(false)
    })
  })

  describe('static methods', () => {
    it('should return supported functions', () => {
      const functions = EquationParser.getSupportedFunctions()
      expect(functions).toContain('sin')
      expect(functions).toContain('cos')
      expect(functions).toContain('exp')
      expect(functions).toContain('log')
    })

    it('should return supported constants', () => {
      const constants = EquationParser.getSupportedConstants()
      expect(constants).toContain('pi')
      expect(constants).toContain('e')
    })
  })
})

describe('NumericalMethods', () => {
  const simpleODE = (t: number, y: number): number => t + y

  describe('euler method', () => {
    it('should take a single Euler step', () => {
      const [newT, newY] = NumericalMethods.euler.solve(simpleODE, 0, 1, 0.1)
      expect(newT).toBeCloseTo(0.1, 6)
      expect(newY).toBeCloseTo(1.1, 6) // y + h * f(t,y) = 1 + 0.1 * (0+1) = 1.1
    })

    it('should have correct metadata', () => {
      expect(NumericalMethods.euler.name).toBe('Euler\'s Method')
      expect(NumericalMethods.euler.order).toBe(1)
    })
  })

  describe('rk4 method', () => {
    it('should take a single RK4 step', () => {
      const [newT, newY] = NumericalMethods.rk4.solve(simpleODE, 0, 1, 0.1)
      expect(newT).toBeCloseTo(0.1, 6)
      // RK4 should be more accurate than Euler for this function
      expect(newY).toBeGreaterThan(1.1)
      expect(newY).toBeLessThan(1.12)
    })

    it('should have correct metadata', () => {
      expect(NumericalMethods.rk4.name).toBe('Runge-Kutta 4th Order')
      expect(NumericalMethods.rk4.order).toBe(4)
    })
  })

  describe('heun method', () => {
    it('should take a single Heun step', () => {
      const [newT, newY] = NumericalMethods.heun.solve(simpleODE, 0, 1, 0.1)
      expect(newT).toBeCloseTo(0.1, 6)
      // Heun should be between Euler and RK4 in accuracy
      expect(newY).toBeGreaterThan(1.1)
      expect(newY).toBeLessThan(1.12)
    })

    it('should have correct metadata', () => {
      expect(NumericalMethods.heun.name).toBe('Heun\'s Method')
      expect(NumericalMethods.heun.order).toBe(2)
    })
  })

  describe('static methods', () => {
    it('should return all methods', () => {
      const methods = NumericalMethods.getAllMethods()
      expect(methods.has('euler')).toBe(true)
      expect(methods.has('rk4')).toBe(true)
      expect(methods.has('heun')).toBe(true)
    })

    it('should get method by name', () => {
      const method = NumericalMethods.getMethod('rk4')
      expect(method).toBeDefined()
      expect(method?.name).toBe('Runge-Kutta 4th Order')
    })

    it('should validate step size', () => {
      // Normal step size
      const result1 = NumericalMethods.validateStepSize(0.1, [0, 1])
      expect(result1.valid).toBe(true)

      // Too large step size
      const result2 = NumericalMethods.validateStepSize(1, [0, 1])
      expect(result2.valid).toBe(false)
      expect(result2.suggested).toBeDefined()

      // Very small step size (should still be valid but with warning)
      const result3 = NumericalMethods.validateStepSize(0.00001, [0, 1])
      expect(result3.valid).toBe(true)
      expect(result3.warning).toBeDefined()
    })

    it('should estimate step size', () => {
      const stepSize = NumericalMethods.estimateStepSize(simpleODE, 0, 1, [0, 2])
      expect(stepSize).toBeGreaterThan(0)
      expect(stepSize).toBeLessThan(1)
    })
  })
})

describe('ODESolver', () => {
  let solver: ODESolver

  beforeEach(() => {
    solver = new ODESolver()
  })

  describe('solve', () => {
    it('should solve simple linear ODE', async () => {
      const solution = await solver.solve('t + y', {
        t0: 0,
        y0: 1,
        tEnd: 1,
        stepSize: 0.1,
        method: 'rk4'
      })

      expect(solution.success).toBe(true)
      expect(solution.points).toHaveLength(11) // 0, 0.1, 0.2, ..., 1.0
      expect(solution.points[0]?.t).toBe(0)
      expect(solution.points[0]?.y).toBe(1)
      expect(solution.points[solution.points.length - 1]?.t).toBeCloseTo(1, 6)
      expect(solution.method).toBe('Runge-Kutta 4th Order')
    })

    it('should handle backward integration', async () => {
      const solution = await solver.solve('t + y', {
        t0: 1,
        y0: 2,
        tEnd: 0,
        stepSize: 0.1,
        method: 'euler'
      })

      expect(solution.success).toBe(true)
      expect(solution.points[0]?.t).toBe(1)
      expect(solution.points[solution.points.length - 1]?.t).toBeCloseTo(0, 6)
    })

    it('should handle trigonometric ODE', async () => {
      const solution = await solver.solve('sin(t)', {
        t0: 0,
        y0: 0,
        tEnd: Math.PI,
        stepSize: 0.1,
        method: 'rk4'
      })

      expect(solution.success).toBe(true)
      expect(solution.points.length).toBeGreaterThan(10)
    })

    it('should fail with invalid equation', async () => {
      const solution = await solver.solve('invalid equation !!!', {
        t0: 0,
        y0: 1,
        tEnd: 1,
        stepSize: 0.1
      })

      expect(solution.success).toBe(false)
      expect(solution.error).toBeDefined()
    })

    it('should fail with invalid options', async () => {
      const solution = await solver.solve('t + y', {
        t0: 0,
        y0: 1,
        tEnd: 0, // Same as t0
        stepSize: 0.1
      })

      expect(solution.success).toBe(false)
      expect(solution.error).toBeDefined()
    })

    it('should fail with negative step size', async () => {
      const solution = await solver.solve('t + y', {
        t0: 0,
        y0: 1,
        tEnd: 1,
        stepSize: -0.1 // Negative
      })

      expect(solution.success).toBe(false)
      expect(solution.error).toBeDefined()
    })

    it('should include computation time', async () => {
      const solution = await solver.solve('t + y', {
        t0: 0,
        y0: 1,
        tEnd: 1,
        stepSize: 0.1,
        method: 'rk4'
      })

      expect(solution.computationTime).toBeGreaterThan(0)
    })

    it('should include metadata', async () => {
      const solution = await solver.solve('t + y', {
        t0: 0,
        y0: 1,
        tEnd: 2,
        stepSize: 0.1,
        method: 'rk4'
      })

      expect(solution.metadata.totalPoints).toBe(solution.points.length)
      expect(solution.metadata.stepSize).toBe(0.1)
      expect(solution.metadata.domain).toEqual([0, 2])
      expect(solution.metadata.range).toHaveLength(2)
    })
  })

  describe('validateEquation', () => {
    it('should validate correct equations', () => {
      const result = solver.validateEquation('t + y')
      expect(result.valid).toBe(true)
    })

    it('should reject incorrect equations', () => {
      const result = solver.validateEquation('t + z')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getAvailableMethods', () => {
    it('should return method information', () => {
      const methods = solver.getAvailableMethods()
      expect(methods).toHaveLength(3)
      expect(methods.some(m => m.key === 'rk4')).toBe(true)
      expect(methods.some(m => m.key === 'euler')).toBe(true)
      expect(methods.some(m => m.key === 'heun')).toBe(true)
    })
  })

  describe('getSupportedMath', () => {
    it('should return supported math functions and constants', () => {
      const math = solver.getSupportedMath()
      expect(math.functions).toContain('sin')
      expect(math.constants).toContain('pi')
    })
  })

  describe('performance tests', () => {
    it('should handle large number of steps efficiently', async () => {
      const startTime = performance.now()
      
      const solution = await solver.solve('t + y', {
        t0: 0,
        y0: 1,
        tEnd: 10,
        stepSize: 0.01, // 1000 steps
        method: 'rk4'
      })

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(solution.success).toBe(true)
      expect(solution.points).toHaveLength(1001)
      expect(totalTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })
})
