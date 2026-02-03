/**
 * Numerical methods for solving ODEs
 * @category ODE
 */

import type { CoupledNumericalMethod, CoupledODEFunction, NumericalMethod, ODEFunction } from './types.js'

/**
 * Collection of numerical methods for solving first-order ODEs
 * @public
 */
export class NumericalMethods {
  /**
   * Euler's Method (1st order)
   * Simple but less accurate method
   * y_{n+1} = y_n + h * f(x_n, y_n)
   */
  public static readonly euler: NumericalMethod = {
    name: 'Euler\'s Method',
    description: 'First-order method, simple but less accurate',
    order: 1,
    solve: (f: ODEFunction, x: number, y: number, h: number): [number, number] => {
      const k1 = f(x, y)
      return [x + h, y + h * k1]
    }
  }

  /**
   * Heun's Method (2nd order)
   * Improved Euler method, better accuracy
   * Predictor: y* = y_n + h * f(x_n, y_n)
   * Corrector: y_{n+1} = y_n + h/2 * [f(x_n, y_n) + f(x_{n+1}, y*)]
   */
  public static readonly heun: NumericalMethod = {
    name: 'Heun\'s Method',
    description: 'Second-order method, improved Euler with better accuracy',
    order: 2,
    solve: (f: ODEFunction, x: number, y: number, h: number): [number, number] => {
      const k1 = f(x, y)
      const yPredictor = y + h * k1
      const k2 = f(x + h, yPredictor)
      
      return [x + h, y + h * (k1 + k2) / 2]
    }
  }

  /**
   * Fourth-Order Runge-Kutta Method (4th order)
   * Most accurate method, industry standard
   * 
   * k1 = f(x_n, y_n)
   * k2 = f(x_n + h/2, y_n + h*k1/2)
   * k3 = f(x_n + h/2, y_n + h*k2/2)
   * k4 = f(x_n + h, y_n + h*k3)
   * y_{n+1} = y_n + h/6 * (k1 + 2*k2 + 2*k3 + k4)
   */
  public static readonly rk4: NumericalMethod = {
    name: 'Runge-Kutta 4th Order',
    description: 'Fourth-order method, highly accurate and widely used',
    order: 4,
    solve: (f: ODEFunction, x: number, y: number, h: number): [number, number] => {
      const k1 = f(x, y)
      const k2 = f(x + h / 2, y + h * k1 / 2)
      const k3 = f(x + h / 2, y + h * k2 / 2)
      const k4 = f(x + h, y + h * k3)
      
      const dy = h * (k1 + 2 * k2 + 2 * k3 + k4) / 6
      return [x + h, y + dy]
    }
  }

  /**
   * Get all available numerical methods
   * @returns Map of method names to NumericalMethod objects
   */
  public static getAllMethods(): Map<string, NumericalMethod> {
    return new Map([
      ['euler', NumericalMethods.euler],
      ['heun', NumericalMethods.heun],
      ['rk4', NumericalMethods.rk4]
    ])
  }

  /**
   * Get method by name
   * @param name - Method name ('euler', 'heun', 'rk4')
   * @returns The numerical method or undefined if not found
   */
  public static getMethod(name: string): NumericalMethod | undefined {
    return NumericalMethods.getAllMethods().get(name.toLowerCase())
  }

  /**
   * Get method names
   * @returns Array of available method names
   */
  public static getMethodNames(): string[] {
    return Array.from(NumericalMethods.getAllMethods().keys())
  }

  /**
   * Validate step size for numerical stability
   * @param stepSize - The proposed step size
   * @param domain - The domain [x0, xEnd]
   * @returns Validation result with suggested adjustments
   */
  public static validateStepSize(stepSize: number, domain: [number, number]): {
    valid: boolean
    suggested?: number
    warning?: string
  } {
    const [x0, xEnd] = domain
    const totalRange = Math.abs(xEnd - x0)
    const numSteps = totalRange / stepSize
    
    // Too large step size (less than 10 steps)
    if (numSteps < 10) {
      const suggested = totalRange / 20
      return {
        valid: false,
        suggested,
        warning: `Step size too large. Consider using h ≤ ${suggested.toPrecision(3)} for better accuracy.`
      }
    }
    
    // Too small step size (more than 100,000 steps)
    if (numSteps > 100000) {
      const suggested = totalRange / 10000
      return {
        valid: false,
        suggested,
        warning: `Step size too small. Consider using h ≥ ${suggested.toPrecision(3)} for faster computation.`
      }
    }
    
    // Very small step size warning
    if (numSteps > 50000) {
      return {
        valid: true,
        warning: `Large number of steps (${Math.round(numSteps)}). Computation may take some time.`
      }
    }
    
    return { valid: true }
  }

  /**
   * Estimate optimal step size based on the function and domain
   * @param f - The ODE function
   * @param x0 - Initial x value
   * @param y0 - Initial y value
   * @param domain - The solution domain
   * @returns Suggested step size
   */
  public static estimateStepSize(
    f: ODEFunction, 
    x0: number, 
    y0: number, 
    domain: [number, number]
  ): number {
    const [, xEnd] = domain
    const totalRange = Math.abs(xEnd - x0)
    
    try {
      // Sample the derivative at a few points to estimate its magnitude
      const samplePoints = 5
      let maxDerivative = 0
      
      for (let i = 0; i <= samplePoints; i++) {
        const x = x0 + (xEnd - x0) * i / samplePoints
        // Use initial y value as approximation for all points
        const derivative = Math.abs(f(x, y0))
        if (Number.isFinite(derivative)) {
          maxDerivative = Math.max(maxDerivative, derivative)
        }
      }
      
      // If derivative is very small, use default step size
      if (maxDerivative < 1e-6) {
        return Math.min(0.1, totalRange / 100)
      }
      
      // Estimate step size based on derivative magnitude
      // Aim for error tolerance of about 0.001
      const errorTolerance = 0.001
      const suggestedStep = Math.sqrt(2 * errorTolerance / maxDerivative)
      
      // Constrain to reasonable bounds
      const minStep = totalRange / 10000
      const maxStep = totalRange / 20
      
      return Math.max(minStep, Math.min(maxStep, suggestedStep))
    } catch {
      // Fallback to default step size if estimation fails
      return Math.min(0.1, totalRange / 100)
    }
  }
}

/**
 * Collection of numerical methods for solving coupled systems of ODEs
 * @public
 */
export class CoupledNumericalMethods {
  /**
   * Euler's Method for coupled systems (1st order)
   */
  public static readonly euler: CoupledNumericalMethod = {
    name: 'Euler\'s Method (Coupled)',
    description: 'First-order method for coupled systems',
    order: 1,
    solve: (f: CoupledODEFunction, x: number, y: number[], h: number): [number, number[]] => {
      const k1 = f(x, y)
      const newY = y.map((yi, i) => yi + h * (k1[i] ?? 0))
      return [x + h, newY]
    }
  }

  /**
   * Heun's Method for coupled systems (2nd order)
   */
  public static readonly heun: CoupledNumericalMethod = {
    name: 'Heun\'s Method (Coupled)',
    description: 'Second-order method for coupled systems',
    order: 2,
    solve: (f: CoupledODEFunction, x: number, y: number[], h: number): [number, number[]] => {
      const k1 = f(x, y)
      const yPredictor = y.map((yi, i) => yi + h * (k1[i] ?? 0))
      const k2 = f(x + h, yPredictor)
      
      const newY = y.map((yi, i) => yi + h * ((k1[i] ?? 0) + (k2[i] ?? 0)) / 2)
      return [x + h, newY]
    }
  }

  /**
   * Fourth-Order Runge-Kutta Method for coupled systems (4th order)
   */
  public static readonly rk4: CoupledNumericalMethod = {
    name: 'Runge-Kutta 4th Order (Coupled)',
    description: 'Fourth-order method for coupled systems',
    order: 4,
    solve: (f: CoupledODEFunction, x: number, y: number[], h: number): [number, number[]] => {
      const k1 = f(x, y)
      const y1 = y.map((yi, i) => yi + h * (k1[i] ?? 0) / 2)
      
      const k2 = f(x + h / 2, y1)
      const y2 = y.map((yi, i) => yi + h * (k2[i] ?? 0) / 2)
      
      const k3 = f(x + h / 2, y2)
      const y3 = y.map((yi, i) => yi + h * (k3[i] ?? 0))
      
      const k4 = f(x + h, y3)
      
      const newY = y.map((yi, i) => yi + h * ((k1[i] ?? 0) + 2 * (k2[i] ?? 0) + 2 * (k3[i] ?? 0) + (k4[i] ?? 0)) / 6)
      return [x + h, newY]
    }
  }

  /**
   * Get all available coupled numerical methods
   */
  public static getAllMethods(): Map<string, CoupledNumericalMethod> {
    return new Map([
      ['euler', CoupledNumericalMethods.euler],
      ['heun', CoupledNumericalMethods.heun],
      ['rk4', CoupledNumericalMethods.rk4]
    ])
  }

  /**
   * Get coupled method by name
   */
  public static getMethod(name: string): CoupledNumericalMethod | undefined {
    return CoupledNumericalMethods.getAllMethods().get(name.toLowerCase())
  }

  /**
   * Get coupled method names
   */
  public static getMethodNames(): string[] {
    return Array.from(CoupledNumericalMethods.getAllMethods().keys())
  }

  /**
   * Validates step size for coupled systems
   * @param stepSize - Proposed step size
   * @param domain - Integration domain [x0, xEnd]
   * @returns Validation result with suggestions
   */
  public static validateStepSize(
    stepSize: number,
    domain: [number, number]
  ): {
    valid: boolean
    warning?: string
    suggested?: number
  } {
    const [x0, xEnd] = domain
    const totalRange = Math.abs(xEnd - x0)
    
    if (stepSize <= 0) {
      return {
        valid: false,
        warning: 'Step size must be positive',
        suggested: Math.min(0.1, totalRange / 100)
      }
    }
    
    if (stepSize > totalRange) {
      return {
        valid: false,
        warning: 'Step size larger than domain range',
        suggested: totalRange / 10
      }
    }
    
    // For coupled systems, we might need smaller step sizes for stability
    if (stepSize > totalRange / 10) {
      return {
        valid: true,
        warning: 'Step size might be too large for coupled systems, consider smaller values',
        suggested: totalRange / 50
      }
    }
    
    if (stepSize < totalRange / 100000) {
      return {
        valid: true,
        warning: 'Very small step size may lead to slow computation',
        suggested: totalRange / 1000
      }
    }
    
    return { valid: true }
  }

  /**
   * Estimates appropriate step size for coupled systems
   * @param f - The coupled ODE function
   * @param x0 - Initial x value
   * @param y0 - Initial y values
   * @param domain - The solution domain
   * @returns Suggested step size
   */
  public static estimateStepSize(
    f: CoupledODEFunction,
    x0: number,
    y0: number[],
    domain: [number, number]
  ): number {
    const [, xEnd] = domain
    const totalRange = Math.abs(xEnd - x0)
    
    try {
      // Sample the derivatives at a few points to estimate their magnitude
      const samplePoints = 5
      let maxDerivativeMagnitude = 0
      
      for (let i = 0; i <= samplePoints; i++) {
        const x = x0 + (xEnd - x0) * i / samplePoints
        // Use initial y values as approximation for all points
        const derivatives = f(x, y0)
        
        // Find the maximum derivative magnitude across all variables
        for (const derivative of derivatives) {
          if (Number.isFinite(derivative)) {
            maxDerivativeMagnitude = Math.max(maxDerivativeMagnitude, Math.abs(derivative))
          }
        }
      }
      
      // If derivative is very small, use default step size
      if (maxDerivativeMagnitude < 1e-6) {
        return Math.min(0.1, totalRange / 100)
      }
      
      // Estimate step size based on derivative magnitude
      // For coupled systems, use more conservative error tolerance
      const errorTolerance = 0.0001
      const suggestedStep = Math.sqrt(2 * errorTolerance / maxDerivativeMagnitude)
      
      // Constrain to reasonable bounds
      const minStep = totalRange / 50000
      const maxStep = totalRange / 50 // More conservative for coupled systems
      
      return Math.max(minStep, Math.min(maxStep, suggestedStep))
    } catch {
      // Fallback to conservative default step size if estimation fails
      return Math.min(0.01, totalRange / 1000)
    }
  }
}
