# Error Handling

Learn how to handle errors gracefully when using OdeTest.

## Understanding OdeTest Errors

OdeTest throws specific errors for different scenarios to help you handle them appropriately.

### Division by Zero

```typescript
import { Calculator } from 'odetest'

const calc = new Calculator()

try {
  const result = calc.divide(10, 0)
} catch (error) {
  console.error('Error:', error.message) // "Division by zero is not allowed"
  // Handle division by zero case
  console.log('Using default value instead')
  const fallbackResult = 0
}
```

### Invalid Numbers

```typescript
const calc = new Calculator()

try {
  const result = calc.add(5, NaN)
} catch (error) {
  console.error('Error:', error.message) // "Invalid number: NaN. Must be finite and within safe range."
  // Handle invalid input
  console.log('Please provide valid numbers')
}

try {
  const result = calc.multiply(Infinity, 2)
} catch (error) {
  console.error('Error:', error.message) // "Invalid number: Infinity..."
}
```

### Negative Square Root

```typescript
const calc = new Calculator()

try {
  const result = calc.sqrt(-4)
} catch (error) {
  console.error('Error:', error.message) // "Cannot calculate square root of negative number"
  // Handle complex number scenario
  console.log('Consider using complex number library for negative square roots')
}
```

### Insufficient Operands

```typescript
const calc = new Calculator()

try {
  const result = calc.add(5) // Needs at least 2 operands
} catch (error) {
  console.error('Error:', error.message) // "At least 2 operand(s) required"
}
```

### Value Range Exceeded

```typescript
const calc = new Calculator({ maxValue: 1000 })

try {
  const result = calc.add(1500, 500) // Exceeds maxValue
} catch (error) {
  console.error('Error:', error.message) // "Invalid number: 1500..."
  // Handle range validation
  console.log('Please use smaller numbers')
}
```

## Error Handling Patterns

### Try-Catch with Specific Handling

```typescript
import { Calculator } from 'odetest'

function safeCalculate(operation: string, a: number, b: number): number | null {
  const calc = new Calculator()
  
  try {
    switch (operation) {
      case 'add':
        return calc.add(a, b)
      case 'subtract':
        return calc.subtract(a, b)
      case 'multiply':
        return calc.multiply(a, b)
      case 'divide':
        return calc.divide(a, b)
      case 'power':
        return calc.power(a, b)
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  } catch (error) {
    if (error.message.includes('Division by zero')) {
      console.warn('Division by zero detected, returning null')
      return null
    } else if (error.message.includes('Invalid number')) {
      console.error('Invalid input provided:', { a, b })
      return null
    } else if (error.message.includes('square root of negative')) {
      console.warn('Negative square root attempted, returning null')
      return null
    } else {
      console.error('Unexpected error:', error.message)
      throw error // Re-throw unexpected errors
    }
  }
}

// Usage
const result1 = safeCalculate('divide', 10, 0)    // null (logged warning)
const result2 = safeCalculate('add', 5, 3)        // 8
const result3 = safeCalculate('add', NaN, 5)      // null (logged error)
```

### Error Result Pattern

```typescript
interface CalculationResult {
  success: boolean
  value?: number
  error?: string
  operation: string
  inputs: number[]
}

class ResultCalculator {
  private calc = new Calculator()

  public safeAdd(a: number, b: number): CalculationResult {
    try {
      const value = this.calc.add(a, b)
      return {
        success: true,
        value,
        operation: 'add',
        inputs: [a, b]
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        operation: 'add',
        inputs: [a, b]
      }
    }
  }

  public safeDivide(a: number, b: number): CalculationResult {
    try {
      const value = this.calc.divide(a, b)
      return {
        success: true,
        value,
        operation: 'divide',
        inputs: [a, b]
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        operation: 'divide',
        inputs: [a, b]
      }
    }
  }
}

// Usage
const calc = new ResultCalculator()

const result1 = calc.safeAdd(5, 3)
if (result1.success) {
  console.log('Result:', result1.value) // 8
} else {
  console.error('Error:', result1.error)
}

const result2 = calc.safeDivide(10, 0)
if (!result2.success) {
  console.error('Division failed:', result2.error)
  // Handle error case
}
```

### Validation Before Calculation

```typescript
import { MathUtils } from 'odetest'

class ValidatingCalculator {
  private calc = new Calculator()

  private validateInputs(numbers: number[]): string[] {
    const errors: string[] = []

    for (const [index, num] of numbers.entries()) {
      if (!MathUtils.isSafeNumber(num)) {
        if (Number.isNaN(num)) {
          errors.push(`Input ${index + 1} is NaN`)
        } else if (!Number.isFinite(num)) {
          errors.push(`Input ${index + 1} is not finite (${num})`)
        }
      }
    }

    return errors
  }

  public add(...numbers: number[]): number {
    const errors = this.validateInputs(numbers)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    if (numbers.length < 2) {
      throw new Error('Addition requires at least 2 numbers')
    }

    return this.calc.add(...numbers)
  }

  public divide(a: number, b: number): number {
    const errors = this.validateInputs([a, b])
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    if (b === 0) {
      throw new Error('Cannot divide by zero')
    }

    return this.calc.divide(a, b)
  }
}

// Usage with better error messages
const calc = new ValidatingCalculator()

try {
  const result = calc.add(1, NaN, 3)
} catch (error) {
  console.error(error.message) // "Validation failed: Input 2 is NaN"
}
```

### Error Recovery Strategies

```typescript
class ResilientCalculator {
  private calc = new Calculator()

  public robustDivide(a: number, b: number, fallback = 0): number {
    try {
      return this.calc.divide(a, b)
    } catch (error) {
      if (error.message.includes('Division by zero')) {
        console.warn(`Division by zero: ${a}/${b}, using fallback value: ${fallback}`)
        return fallback
      }
      throw error // Re-throw other errors
    }
  }

  public cleanAndAdd(...numbers: number[]): number {
    // Remove invalid numbers and proceed
    const validNumbers = numbers.filter(n => MathUtils.isSafeNumber(n))
    
    if (validNumbers.length === 0) {
      throw new Error('No valid numbers provided')
    }
    
    if (validNumbers.length === 1) {
      console.warn('Only one valid number found, treating as identity operation')
      return validNumbers[0]
    }
    
    if (validNumbers.length !== numbers.length) {
      console.warn(`Filtered out ${numbers.length - validNumbers.length} invalid numbers`)
    }
    
    return this.calc.add(...validNumbers)
  }

  public attemptSqrt(value: number): number | null {
    try {
      return this.calc.sqrt(value)
    } catch (error) {
      if (error.message.includes('negative number')) {
        console.info(`Cannot calculate sqrt of ${value}, returning null`)
        return null
      }
      throw error
    }
  }
}

// Usage
const calc = new ResilientCalculator()

const result1 = calc.robustDivide(10, 0, -1)           // -1 (with warning)
const result2 = calc.cleanAndAdd(1, NaN, 3, Infinity, 5) // 9 (with warning)
const result3 = calc.attemptSqrt(-4)                    // null (with info log)
```

## Best Practices

### 1. Always Handle Expected Errors

```typescript
// Good: Handle known error cases
function calculateArea(radius: number): number | null {
  if (radius < 0) {
    console.error('Radius cannot be negative')
    return null
  }

  try {
    const calc = new Calculator()
    const pi = 3.14159
    return calc.multiply(pi, calc.power(radius, 2))
  } catch (error) {
    console.error('Calculation failed:', error.message)
    return null
  }
}
```

### 2. Provide Meaningful Error Context

```typescript
// Good: Contextual error information
function processUserInput(input: string): number | null {
  const num = parseFloat(input)
  
  try {
    const calc = new Calculator()
    return calc.sqrt(num)
  } catch (error) {
    console.error(`Failed to calculate square root of user input "${input}": ${error.message}`)
    return null
  }
}
```

### 3. Use Type Guards for Validation

```typescript
function isValidCalculationInput(value: unknown): value is number {
  return typeof value === 'number' && MathUtils.isSafeNumber(value)
}

function safeCalculation(a: unknown, b: unknown): number | null {
  if (!isValidCalculationInput(a) || !isValidCalculationInput(b)) {
    console.error('Invalid inputs provided')
    return null
  }

  const calc = new Calculator()
  return calc.add(a, b)
}
```

## Testing Error Cases

```typescript
// In your test files
import { describe, expect, it } from 'vitest'
import { Calculator } from 'odetest'

describe('Calculator Error Handling', () => {
  it('should throw error for division by zero', () => {
    const calc = new Calculator()
    expect(() => calc.divide(5, 0)).toThrow('Division by zero is not allowed')
  })

  it('should throw error for invalid numbers', () => {
    const calc = new Calculator()
    expect(() => calc.add(1, NaN)).toThrow('Invalid number: NaN')
    expect(() => calc.multiply(Infinity, 2)).toThrow('Invalid number: Infinity')
  })

  it('should throw error for negative square root', () => {
    const calc = new Calculator()
    expect(() => calc.sqrt(-4)).toThrow('Cannot calculate square root of negative number')
  })
})
```
