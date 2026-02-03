/**
 * @fileoverview Main entry point for the OdeTest application
 * @category Core
 */

export { Calculator } from './components/calculator.js'
export { MathUtils } from './utils/math-utils.js'
export type { CalculatorOptions, MathOperation } from './types/index.js'

// ODE Solver exports
export {
  CoupledODESolver,
  CoupledNumericalMethods,
  EquationParser,
  NumericalMethods,
  ODESolver
} from './ode-solver/index.js'

export type {
  CoupledNumericalMethod,
  CoupledODEFunction,
  CoupledODEOptions,
  CoupledODESolution,
  CoupledSolutionPoint,
  NumericalMethod,
  ODEFunction,
  ODEOptions,
  ODESolution,
  ParsedCoupledEquations,
  ParsedEquation,
  SolutionPoint
} from './ode-solver/index.js'

/**
 * Application version
 * @public
 */
export const VERSION = '1.0.0'

/**
 * Default configuration for the application
 * @public
 */
export const DEFAULT_CONFIG = {
  precision: 2,
  enableLogging: false,
} as const
