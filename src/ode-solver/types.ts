/**
 * Type definitions for the ODE solver
 * @category ODE
 */

/**
 * Represents a point in the solution for single ODE
 * @public
 */
export interface SolutionPoint {
  /** t-coordinate (time/independent variable) */
  t: number
  /** y-coordinate */
  y: number
  /** Derivative dy/dt at this point */
  dydt: number
}

/**
 * Represents a point in the solution for coupled ODEs
 * @public
 */
export interface CoupledSolutionPoint {
  /** t-coordinate (time/independent variable) */
  t: number
  /** y-coordinates array [y1, y2, ..., yn] */
  y: number[]
  /** Derivatives array [dy1/dt, dy2/dt, ..., dyn/dt] */
  dydt: number[]
}

/**
 * Configuration options for ODE solving
 * @public
 */
export interface ODEOptions {
  /** Initial t value */
  t0: number
  /** Initial y value */
  y0: number
  /** End t value */
  tEnd: number
  /** Step size */
  stepSize: number
  /** Numerical method to use */
  method?: 'euler' | 'rk4' | 'heun'
  /** Maximum number of iterations (safety limit) */
  maxIterations?: number
}

/**
 * Configuration options for coupled ODE solving
 * @public
 */
export interface CoupledODEOptions {
  /** Initial t value */
  t0: number
  /** Initial y values array [y1_0, y2_0, ..., yn_0] */
  y0: number[]
  /** End t value */
  tEnd: number
  /** Step size */
  stepSize: number
  /** Numerical method to use */
  method?: 'euler' | 'rk4' | 'heun'
  /** Maximum number of iterations (safety limit) */
  maxIterations?: number
}

/**
 * Result of ODE solving
 * @public
 */
export interface ODESolution {
  /** Array of solution points */
  points: SolutionPoint[]
  /** Method used for solving */
  method: string
  /** Computation time in milliseconds */
  computationTime: number
  /** Success status */
  success: boolean
  /** Error message if solving failed */
  error?: string
  /** Metadata about the solution */
  metadata: {
    totalPoints: number
    stepSize: number
    domain: [number, number]
    range: [number, number]
  }
}

/**
 * Result of coupled ODE solving
 * @public
 */
export interface CoupledODESolution {
  /** Array of solution points */
  points: CoupledSolutionPoint[]
  /** Method used for solving */
  method: string
  /** Computation time in milliseconds */
  computationTime: number
  /** Success status */
  success: boolean
  /** Error message if solving failed */
  error?: string
  /** Metadata about the solution */
  metadata: {
    totalPoints: number
    stepSize: number
    domain: [number, number]
    ranges: [number, number][] // One range per variable
  }
}

/**
 * Function type for differential equations
 * f(t, y) representing dy/dt = f(t, y)
 * @public
 */
export type ODEFunction = (t: number, y: number) => number

/**
 * Function type for coupled differential equations
 * f(t, y) representing dy/dt = f(t, y) where y is a vector
 * Returns array of derivatives [dy1/dt, dy2/dt, ..., dyn/dt]
 * @public
 */
export type CoupledODEFunction = (t: number, y: number[]) => number[]

/**
 * Parsed equation information
 * @public
 */
export interface ParsedEquation {
  /** The original equation string */
  original: string
  /** The compiled function */
  evaluate: ODEFunction
  /** Variables found in the equation */
  variables: string[]
  /** Whether parsing was successful */
  valid: boolean
  /** Error message if parsing failed */
  error?: string
}

/**
 * Parsed coupled equations information
 * @public
 */
export interface ParsedCoupledEquations {
  /** The original equation strings */
  original: string[]
  /** The compiled function */
  evaluate: CoupledODEFunction
  /** Variables found in the equations */
  variables: string[]
  /** Whether parsing was successful */
  valid: boolean
  /** Error message if parsing failed */
  error?: string
}

/**
 * Numerical method interface
 * @public
 */
export interface NumericalMethod {
  /** Name of the method */
  name: string
  /** Description of the method */
  description: string
  /** Order of accuracy */
  order: number
  /** Implementation function */
  solve: (f: ODEFunction, t0: number, y0: number, h: number) => [number, number]
}

/**
 * Coupled numerical method interface
 * @public
 */
export interface CoupledNumericalMethod {
  /** Name of the method */
  name: string
  /** Description of the method */
  description: string
  /** Order of accuracy */
  order: number
  /** Implementation function */
  solve: (f: CoupledODEFunction, t0: number, y0: number[], h: number) => [number, number[]]
}
