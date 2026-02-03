/**
 * Mathematical expression parser for ODE equations
 * @category ODE
 */

import { parse } from 'mathjs'
import type { CoupledODEFunction, ODEFunction, ParsedCoupledEquations, ParsedEquation } from './types.js'

/**
 * Parses and compiles mathematical expressions for ODE solving
 * @public
 */
export class EquationParser {
  private static readonly ALLOWED_FUNCTIONS = new Set([
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot',
    'asin', 'acos', 'atan', 'atan2',
    'sinh', 'cosh', 'tanh',
    'exp', 'log', 'log10', 'log2',
    'sqrt', 'cbrt', 'pow', 'abs',
    'floor', 'ceil', 'round', 'sign',
    'max', 'min', 'random'
  ])

  private static readonly ALLOWED_CONSTANTS = new Set([
    'pi', 'PI', 'e', 'E', 'i'
  ])

  private static readonly VARIABLE_PATTERN = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g

  /**
   * Parses a mathematical expression string into a function
   * @param expression - The mathematical expression (e.g., "x + y", "sin(x) * y")
   * @returns Parsed equation with compiled function
   * 
   * @example
   * ```typescript
   * const parser = new EquationParser()
   * const parsed = parser.parse("x + y")
   * if (parsed.valid) {
   *   const result = parsed.evaluate(1, 2) // Returns 3
   * }
   * ```
   */
  public parse(expression: string): ParsedEquation {
    try {
      // Clean and normalize the expression
      const cleanExpression = this.normalizeExpression(expression)
      
      // Find variables in the expression
      const variables = this.extractVariables(cleanExpression)
      
      // Validate variables (should only contain t and y for ODE)
      const invalidVars = variables.filter(v => !['t', 'y'].includes(v))
      if (invalidVars.length > 0) {
        return {
          original: expression,
          evaluate: (): never => { throw new Error('Invalid variables') },
          variables,
          valid: false,
          error: `Invalid variables found: ${invalidVars.join(', ')}. Only 't' and 'y' are allowed.`
        }
      }

      // Parse the expression using mathjs
      const compiledExpression = parse(cleanExpression)
      
      // Create evaluation function
      const evaluate: ODEFunction = (t: number, y: number) => {
        try {
          return compiledExpression.evaluate({ t, y }) as number
        } catch (error) {
          throw new Error(`Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      // Test the function with sample values
      try {
        const testResult = evaluate(1, 1)
        if (!Number.isFinite(testResult)) {
          throw new Error('Function produces non-finite values')
        }
      } catch (error) {
        return {
          original: expression,
          evaluate,
          variables,
          valid: false,
          error: `Function test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }

      return {
        original: expression,
        evaluate,
        variables,
        valid: true
      }
    } catch (error) {
      return {
        original: expression,
        evaluate: (): never => { throw new Error('Parse error') },
        variables: [],
        valid: false,
        error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Parses a system of coupled differential equations
   * @param expressions - Array of mathematical expressions for each equation
   * @returns Parsed coupled equations with compiled function
   * 
   * @example
   * ```typescript
   * const parser = new EquationParser()
   * const parsed = parser.parseCoupled([
   *   "y2",           // dy1/dx = y2
   *   "-y1"           // dy2/dx = -y1 (harmonic oscillator)
   * ])
   * if (parsed.valid) {
   *   const result = parsed.evaluate(0, [1, 0]) // Returns [0, -1]
   * }
   * ```
   */
  public parseCoupled(expressions: string[]): ParsedCoupledEquations {
    try {
      if (!expressions.length) {
        return {
          original: [],
          variables: [],
          valid: false,
          error: 'No equations provided',
          evaluate: (): never => { throw new Error('No equations') }
        }
      }

      const cleanExpressions = expressions.map(expr => this.normalizeExpression(expr))
      const allVariables = new Set<string>()
      const parsedTrees: unknown[] = []

      // Parse each expression and collect variables
      for (const expr of cleanExpressions) {
        const variables = this.extractVariables(expr)
        variables.forEach(v => allVariables.add(v))
        
        // Parse the expression
        const tree = parse(expr)
        parsedTrees.push(tree)
      }

      const variableArray = Array.from(allVariables).sort()
      
      // Validate variables - for coupled systems, we expect y1, y2, ..., yn and t
      const expectedPattern = /^(t|y\d+)$/
      for (const variable of variableArray) {
        if (!expectedPattern.test(variable)) {
          return {
            original: expressions,
            variables: variableArray,
            valid: false,
            error: `Invalid variable '${variable}'. Expected format: t, y1, y2, y3, etc.`,
            evaluate: (): never => { throw new Error('Invalid variables') }
          }
        }
      }

      // Create the evaluation function
      const evaluate: CoupledODEFunction = (t: number, y: number[]): number[] => {
        const context: Record<string, number> = { t }
        
        // Map y array to y1, y2, y3, etc.
        for (let i = 0; i < y.length; i++) {
          const yValue = y[i]
          if (yValue !== undefined) {
            context[`y${i + 1}`] = yValue
          }
        }

        return parsedTrees.map((tree: unknown) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const result = (tree as any).evaluate(context) as unknown
            if (typeof result !== 'number' || !Number.isFinite(result)) {
              throw new Error('Non-numeric result')
            }
            return result
          } catch (error) {
            throw new Error(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        })
      }

      return {
        original: expressions,
        variables: variableArray,
        valid: true,
        evaluate
      }

    } catch (error) {
      return {
        original: expressions,
        variables: [],
        valid: false,
        error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        evaluate: (): never => { throw new Error('Parse error') }
      }
    }
  }

  /**
   * Normalizes mathematical expression for consistent parsing
   * @private
   */
  private normalizeExpression(expression: string): string {
    let normalized = expression.trim()
    
    // Convert common mathematical notations
    normalized = normalized
      // Convert ^ to pow() function
      .replace(/\b(\w+|\([^)]+\))\s*\^\s*(\w+|\([^)]+\))/g, 'pow($1, $2)')
      // Convert ** to pow() function
      .replace(/\b(\w+|\([^)]+\))\s*\*\*\s*(\w+|\([^)]+\))/g, 'pow($1, $2)')
      // Handle implicit multiplication with parentheses
      .replace(/(\w)\s*\(/g, '$1*(')
      .replace(/\)\s*(\w)/g, ')*$1')
      // Convert common constants
      .replace(/\bpi\b/gi, 'pi')
      .replace(/\be\b(?!\w)/gi, 'e')
      // Ensure proper spacing around operators
      .replace(/([+\-*/])/g, ' $1 ')
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      .trim()

    return normalized
  }

  /**
   * Extracts variable names from expression
   * @private
   */
  private extractVariables(expression: string): string[] {
    const variables = new Set<string>()
    let match: RegExpExecArray | null
    
    // Reset regex state
    EquationParser.VARIABLE_PATTERN.lastIndex = 0
    
    while ((match = EquationParser.VARIABLE_PATTERN.exec(expression)) !== null) {
      const variable = match[1]
      
      if (variable === null || variable === undefined || variable.trim() === '') continue
      
      // Skip known functions and constants
      if (!EquationParser.ALLOWED_FUNCTIONS.has(variable) && 
          !EquationParser.ALLOWED_CONSTANTS.has(variable)) {
        variables.add(variable)
      }
    }
    
    return Array.from(variables).sort()
  }

  /**
   * Validates if an expression is safe to evaluate
   * @param expression - The expression to validate
   * @returns true if the expression is safe
   */
  public validateExpression(expression: string): { valid: boolean; error?: string } {
    try {
      // Check for dangerous patterns
      const dangerousPatterns = [
        /import/i,
        /require/i,
        /eval/i,
        /function/i,
        /while/i,
        /for/i,
        /if/i,
        /var/i,
        /let/i,
        /const/i,
        /=>/,
        /\.\./,
        /__/,
        /prototype/i
      ]

      for (const pattern of dangerousPatterns) {
        if (pattern.test(expression)) {
          return {
            valid: false,
            error: `Potentially unsafe expression detected: ${pattern.source}`
          }
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Gets a list of supported mathematical functions
   * @returns Array of supported function names
   */
  public static getSupportedFunctions(): string[] {
    return Array.from(EquationParser.ALLOWED_FUNCTIONS).sort()
  }

  /**
   * Gets a list of supported mathematical constants
   * @returns Array of supported constant names
   */
  public static getSupportedConstants(): string[] {
    return Array.from(EquationParser.ALLOWED_CONSTANTS).sort()
  }
}
