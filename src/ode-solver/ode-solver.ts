/**
 * Main ODE solver class
 * @category ODE
 */

import { EquationParser } from './equation-parser.js'
import { CoupledNumericalMethods, NumericalMethods } from './numerical-methods.js'
import type { 
  CoupledNumericalMethod, 
  CoupledODEFunction, 
  CoupledODEOptions, 
  CoupledODESolution, 
  CoupledSolutionPoint,
  NumericalMethod, 
  ODEFunction, 
  ODEOptions, 
  ODESolution, 
  SolutionPoint 
} from './types.js'

/**
 * Solves first-order ordinary differential equations using various numerical methods
 * @public
 */
export class ODESolver {
  private parser: EquationParser
  
  constructor() {
    this.parser = new EquationParser()
  }

  /**
   * Solves an ODE given as a string expression
   * @param expression - The right-hand side of dy/dt = f(t,y)
   * @param options - Configuration options for solving
   * @returns Promise resolving to the solution
   * 
   * @example
   * ```typescript
   * const solver = new ODESolver()
   * const solution = await solver.solve('t + y', {
   *   t0: 0, y0: 1, tEnd: 2, stepSize: 0.1, method: 'rk4'
   * })
   * ```
   */
  public async solve(expression: string, options: ODEOptions): Promise<ODESolution> {
    const startTime = performance.now()
    
    try {
      // Parse the equation
      const parsedEq = this.parser.parse(expression)
      if (!parsedEq.valid) {
        return {
          points: [],
          method: options.method ?? 'rk4',
          computationTime: performance.now() - startTime,
          success: false,
          error: parsedEq.error ?? 'Unknown parsing error',
          metadata: {
            totalPoints: 0,
            stepSize: options.stepSize,
            domain: [options.t0, options.tEnd],
            range: [0, 0]
          }
        }
      }

      // Solve using the parsed function
      return await this.solveWithFunction(parsedEq.evaluate, options, startTime)
    } catch (error) {
      return {
        points: [],
        method: options.method ?? 'rk4',
        computationTime: performance.now() - startTime,
        success: false,
        error: `Solver error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          totalPoints: 0,
          stepSize: options.stepSize,
          domain: [options.t0, options.tEnd],
          range: [0, 0]
        }
      }
    }
  }

  /**
   * Solves an ODE given as a function
   * @param f - The ODE function dy/dx = f(x,y)
   * @param options - Configuration options for solving
   * @param startTime - Start time for performance measurement (optional)
   * @returns Promise resolving to the solution
   */
  public async solveWithFunction(
    f: ODEFunction, 
    options: ODEOptions, 
    startTime?: number
  ): Promise<ODESolution> {
    const computationStart = startTime ?? performance.now()
    
    try {
      // Validate options
      const validation = this.validateOptions(options)
      if (!validation.valid) {
        return {
        points: [],
        method: options.method ?? 'rk4',
        computationTime: performance.now() - computationStart,
        success: false,
        error: validation.error ?? 'Unknown validation error',
          metadata: {
            totalPoints: 0,
            stepSize: options.stepSize,
            domain: [options.t0, options.tEnd],
            range: [0, 0]
          }
        }
      }

      // Get numerical method
      const methodName = options.method ?? 'rk4'
      const method = NumericalMethods.getMethod(methodName)
      if (!method) {
        return {
          points: [],
          method: methodName,
          computationTime: performance.now() - computationStart,
          success: false,
          error: `Unknown numerical method: ${methodName}`,
          metadata: {
            totalPoints: 0,
            stepSize: options.stepSize,
            domain: [options.t0, options.tEnd],
            range: [0, 0]
          }
        }
      }

      // Solve the ODE
      const solution = await this.numericalSolve(f, options, method)
      const endTime = performance.now()

      return {
        ...solution,
        computationTime: endTime - computationStart
      }
    } catch (error) {
      return {
        points: [],
        method: options.method ?? 'rk4',
        computationTime: performance.now() - computationStart,
        success: false,
        error: `Computation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          totalPoints: 0,
          stepSize: options.stepSize,
          domain: [options.t0, options.tEnd],
          range: [0, 0]
        }
      }
    }
  }

  /**
   * Performs the numerical solving
   * @private
   */
  private async numericalSolve(
    f: ODEFunction,
    options: ODEOptions,
    method: NumericalMethod
  ): Promise<Omit<ODESolution, 'computationTime'>> {
    const { t0, y0, tEnd, stepSize } = options
    const maxIterations = options.maxIterations ?? 1000000
    
    const points: SolutionPoint[] = []
    let t = t0
    let y = y0
    let iterations = 0
    
    // Direction of integration
    const h = tEnd > t0 ? Math.abs(stepSize) : -Math.abs(stepSize)
    const isForward = tEnd > t0
    
    // Add initial point
    points.push({
      t: t0,
      y: y0,
      dydt: f(t0, y0)
    })

    // Main integration loop
    while (iterations < maxIterations) {
      iterations++
      
      // Check if we've reached the end
      if (isForward && t >= tEnd) break
      if (!isForward && t <= tEnd) break
      
      // Adjust step size for last step if needed
      let currentH = h
      if (isForward && t + h > tEnd) {
        currentH = tEnd - t
      } else if (!isForward && t + h < tEnd) {
        currentH = tEnd - t
      }
      
      try {
        // Apply numerical method
        const [newT, newY] = method.solve(f, t, y, currentH)
        
        // Validate result
        if (!Number.isFinite(newT) || !Number.isFinite(newY)) {
          throw new Error(`Non-finite values encountered at t=${t.toFixed(6)}, y=${y.toFixed(6)}`)
        }
        
        // Check for explosive growth
        if (Math.abs(newY) > 1e10) {
          throw new Error(`Solution became unstable (|y| > 1e10) at t=${newT.toFixed(6)}`)
        }
        
        // Update values
        t = newT
        y = newY
        
        // Calculate derivative at new point
        const dydt = f(t, y)
        if (!Number.isFinite(dydt)) {
          throw new Error(`Derivative became non-finite at t=${t.toFixed(6)}, y=${y.toFixed(6)}`)
        }
        
        // Add point to solution
        points.push({ t, y, dydt })
        
        // Yield control occasionally for responsiveness
        if (iterations % 1000 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
        
      } catch (error) {
        throw new Error(`Integration failed at step ${iterations}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (iterations >= maxIterations) {
      throw new Error(`Maximum iterations (${maxIterations}) reached without convergence`)
    }

    // Calculate metadata
    const yValues = points.map(p => p.y)
    const minY = Math.min(...yValues)
    const maxY = Math.max(...yValues)

    return {
      points,
      method: method.name,
      success: true,
      metadata: {
        totalPoints: points.length,
        stepSize: options.stepSize,
        domain: [options.t0, options.tEnd],
        range: [minY, maxY]
      }
    }
  }

  /**
   * Validates ODE solving options
   * @private
   */
  private validateOptions(options: ODEOptions): { valid: boolean; error?: string } {
    const { t0, y0, tEnd, stepSize } = options
    
    // Check for valid numbers
    if (!Number.isFinite(t0) || !Number.isFinite(y0) || !Number.isFinite(tEnd) || !Number.isFinite(stepSize)) {
      return { valid: false, error: 'All parameters must be finite numbers' }
    }
    
    // Check step size
    if (stepSize <= 0) {
      return { valid: false, error: 'Step size must be positive' }
    }
    
    if (stepSize > Math.abs(tEnd - t0)) {
      return { valid: false, error: 'Step size cannot be larger than the integration domain' }
    }
    
    // Check domain
    if (t0 === tEnd) {
      return { valid: false, error: 'Start and end t values cannot be equal' }
    }
    
    // Check for reasonable bounds
    if (Math.abs(tEnd - t0) > 1000) {
      return { valid: false, error: 'Integration domain too large (|tEnd - t0| > 1000)' }
    }
    
    if (Math.abs(y0) > 1e6) {
      return { valid: false, error: 'Initial y value too large (|y0| > 1e6)' }
    }
    
    // Validate step size
    const stepValidation = NumericalMethods.validateStepSize(stepSize, [t0, tEnd])
    if (!stepValidation.valid && stepValidation.warning !== null && stepValidation.warning !== undefined && stepValidation.warning.trim() !== '') {
      return { valid: false, error: stepValidation.warning }
    }
    
    return { valid: true }
  }

  /**
   * Gets information about available numerical methods
   * @returns Array of method information
   */
  public getAvailableMethods(): Array<{
    name: string
    key: string
    description: string
    order: number
  }> {
    return Array.from(NumericalMethods.getAllMethods().entries()).map(([key, method]) => ({
      name: method.name,
      key,
      description: method.description,
      order: method.order
    }))
  }

  /**
   * Gets the equation parser instance
   * @returns The equation parser
   */
  public getParser(): EquationParser {
    return this.parser
  }

  /**
   * Validates an equation string without solving
   * @param expression - The equation to validate
   * @returns Validation result
   */
  public validateEquation(expression: string): { valid: boolean; error?: string } {
    const parsed = this.parser.parse(expression)
    return { valid: parsed.valid, ...(parsed.error !== null && parsed.error !== undefined && parsed.error.trim() !== '' && { error: parsed.error }) }
  }

  /**
   * Gets supported mathematical functions and constants
   * @returns Object with functions and constants
   */
  public getSupportedMath(): { functions: string[]; constants: string[] } {
    return {
      functions: EquationParser.getSupportedFunctions(),
      constants: EquationParser.getSupportedConstants()
    }
  }
}

/**
 * Solves coupled systems of first-order ordinary differential equations
 * @public
 */
export class CoupledODESolver {
  private parser: EquationParser
  
  constructor() {
    this.parser = new EquationParser()
  }

  /**
   * Solves a coupled system of ODEs given as string expressions
   * @param expressions - Array of right-hand side expressions for the system
   * @param options - Configuration options for solving
   * @returns Promise resolving to the solution
   * 
   * @example
   * ```typescript
   * const solver = new CoupledODESolver()
   * const solution = await solver.solve(['y2', '-y1'], {
   *   t0: 0, y0: [1, 0], tEnd: 2*Math.PI, stepSize: 0.1, method: 'rk4'
   * })
   * ```
   */
  public async solve(expressions: string[], options: CoupledODEOptions): Promise<CoupledODESolution> {
    const startTime = performance.now()
    
    try {
      // Parse the equations
      const parsedEqs = this.parser.parseCoupled(expressions)
      if (!parsedEqs.valid) {
        return {
          points: [],
          method: options.method ?? 'rk4',
          computationTime: performance.now() - startTime,
          success: false,
          error: parsedEqs.error ?? 'Unknown parsing error',
          metadata: {
            totalPoints: 0,
            stepSize: options.stepSize,
            domain: [options.t0, options.tEnd],
            ranges: options.y0.map(() => [0, 0])
          }
        }
      }

      // Solve using the parsed function
      return await this.solveWithFunction(parsedEqs.evaluate, options, startTime)
    } catch (error) {
      return {
        points: [],
        method: options.method ?? 'rk4',
        computationTime: performance.now() - startTime,
        success: false,
        error: `Solver error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          totalPoints: 0,
          stepSize: options.stepSize,
          domain: [options.t0, options.tEnd],
          ranges: options.y0.map(() => [0, 0])
        }
      }
    }
  }

  /**
   * Solves a coupled system of ODEs given as a function
   * @param f - The coupled ODE function
   * @param options - Configuration options for solving
   * @param startTime - Start time for performance measurement (optional)
   * @returns Promise resolving to the solution
   */
  public async solveWithFunction(
    f: CoupledODEFunction, 
    options: CoupledODEOptions, 
    startTime?: number
  ): Promise<CoupledODESolution> {
    const computationStart = startTime ?? performance.now()
    
    try {
      // Validate options
      const validation = this.validateOptions(options)
      if (!validation.valid) {
        return {
          points: [],
          method: options.method ?? 'rk4',
          computationTime: performance.now() - computationStart,
          success: false,
          error: validation.error ?? 'Unknown validation error',
          metadata: {
            totalPoints: 0,
            stepSize: options.stepSize,
            domain: [options.t0, options.tEnd],
            ranges: options.y0.map(() => [0, 0])
          }
        }
      }

      // Get numerical method
      const methodName = options.method ?? 'rk4'
      const method = CoupledNumericalMethods.getMethod(methodName)
      if (!method) {
        return {
          points: [],
          method: methodName,
          computationTime: performance.now() - computationStart,
          success: false,
          error: `Unknown numerical method: ${methodName}`,
          metadata: {
            totalPoints: 0,
            stepSize: options.stepSize,
            domain: [options.t0, options.tEnd],
            ranges: options.y0.map(() => [0, 0])
          }
        }
      }

      // Solve the coupled system
      const solution = await this.numericalSolve(f, options, method)
      const endTime = performance.now()

      return {
        ...solution,
        computationTime: endTime - computationStart
      }
    } catch (error) {
      return {
        points: [],
        method: options.method ?? 'rk4',
        computationTime: performance.now() - computationStart,
        success: false,
        error: `Computation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          totalPoints: 0,
          stepSize: options.stepSize,
          domain: [options.t0, options.tEnd],
          ranges: options.y0.map(() => [0, 0])
        }
      }
    }
  }

  /**
   * Performs the numerical solving for coupled systems
   * @private
   */
  private async numericalSolve(
    f: CoupledODEFunction,
    options: CoupledODEOptions,
    method: CoupledNumericalMethod
  ): Promise<Omit<CoupledODESolution, 'computationTime'>> {
    const { t0, y0, tEnd, stepSize } = options
    const maxIterations = options.maxIterations ?? 1000000
    
    const points: CoupledSolutionPoint[] = []
    let t = t0
    let y = [...y0] // Copy the array
    let iterations = 0
    
    // Direction of integration
    const h = tEnd > t0 ? Math.abs(stepSize) : -Math.abs(stepSize)
    const isForward = tEnd > t0
    
    // Add initial point
    points.push({
      t: t0,
      y: [...y0],
      dydt: f(t0, y0)
    })

    // Main integration loop
    while (iterations < maxIterations) {
      iterations++
      
      // Check if we've reached the end
      if (isForward && t >= tEnd) break
      if (!isForward && t <= tEnd) break
      
      // Adjust step size for last step if needed
      let currentH = h
      if (isForward && t + h > tEnd) {
        currentH = tEnd - t
      } else if (!isForward && t + h < tEnd) {
        currentH = tEnd - t
      }
      
      try {
        // Apply numerical method
        const [newT, newY] = method.solve(f, t, y, currentH)
        
        // Validate result
        if (!Number.isFinite(newT) || newY.some(yi => !Number.isFinite(yi))) {
          throw new Error(`Non-finite values encountered at t=${t.toFixed(6)}`)
        }
        
        // Check for explosive growth
        if (newY.some(yi => Math.abs(yi) > 1e10)) {
          throw new Error(`Solution became unstable at t=${newT.toFixed(6)}`)
        }
        
        // Update values
        t = newT
        y = newY
        
        // Calculate derivatives at new point
        const dydt = f(t, y)
        if (dydt.some(derivative => !Number.isFinite(derivative))) {
          throw new Error(`Derivative became non-finite at t=${t.toFixed(6)}`)
        }
        
        // Add point to solution
        points.push({ t, y: [...y], dydt })
        
        // Yield control occasionally for responsiveness
        if (iterations % 1000 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
        
      } catch (error) {
        throw new Error(`Integration failed at step ${iterations}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (iterations >= maxIterations) {
      throw new Error(`Maximum iterations (${maxIterations}) reached without convergence`)
    }

    // Calculate metadata
    const ranges: [number, number][] = []
    for (let i = 0; i < y0.length; i++) {
      const yValues = points.map(p => p.y[i] ?? 0)
      ranges.push([Math.min(...yValues), Math.max(...yValues)])
    }

    return {
      points,
      method: method.name,
      success: true,
      metadata: {
        totalPoints: points.length,
        stepSize: options.stepSize,
        domain: [options.t0, options.tEnd],
        ranges
      }
    }
  }

  /**
   * Validates coupled ODE solving options
   * @private
   */
  private validateOptions(options: CoupledODEOptions): { valid: boolean; error?: string } {
    const { t0, y0, tEnd, stepSize } = options
    
    // Check for valid numbers
    if (!Number.isFinite(t0) || !Number.isFinite(tEnd) || !Number.isFinite(stepSize)) {
      return { valid: false, error: 't0, tEnd, and stepSize must be finite numbers' }
    }
    
    if (!Array.isArray(y0) || y0.length === 0) {
      return { valid: false, error: 'y0 must be a non-empty array' }
    }
    
    if (!y0.every(yi => Number.isFinite(yi))) {
      return { valid: false, error: 'All initial y values must be finite numbers' }
    }
    
    // Check step size
    if (stepSize <= 0) {
      return { valid: false, error: 'Step size must be positive' }
    }
    
    if (stepSize > Math.abs(tEnd - t0)) {
      return { valid: false, error: 'Step size cannot be larger than the integration domain' }
    }
    
    // Check domain
    if (t0 === tEnd) {
      return { valid: false, error: 'Start and end t values cannot be equal' }
    }
    
    // Check for reasonable bounds
    if (Math.abs(tEnd - t0) > 1000) {
      return { valid: false, error: 'Integration domain too large (|tEnd - t0| > 1000)' }
    }
    
    if (y0.some(yi => Math.abs(yi) > 1e6)) {
      return { valid: false, error: 'Initial y values too large (|y0[i]| > 1e6)' }
    }
    
    return { valid: true }
  }

  /**
   * Gets information about available numerical methods for coupled systems
   */
  public getAvailableMethods(): Array<{
    name: string
    key: string
    description: string
    order: number
  }> {
    return Array.from(CoupledNumericalMethods.getAllMethods().entries()).map(([key, method]) => ({
      name: method.name,
      key,
      description: method.description,
      order: method.order
    }))
  }

  /**
   * Gets the equation parser instance
   */
  public getParser(): EquationParser {
    return this.parser
  }

  /**
   * Validates coupled equations without solving
   */
  public validateEquations(expressions: string[]): { valid: boolean; error?: string } {
    const parsed = this.parser.parseCoupled(expressions)
    return { 
      valid: parsed.valid, 
      ...(parsed.error !== null && parsed.error !== undefined && { error: parsed.error }) 
    }
  }
}
