# Advanced Features

Explore advanced capabilities and patterns for using OdeTest.

## Custom Validation

```typescript
import { Calculator, MathUtils } from 'odetest'

class ValidatedCalculator extends Calculator {
  constructor(options = {}) {
    super({
      maxValue: 1000000, // Custom limit
      ...options
    })
  }

  // Override to add custom validation
  public override add(...operands: number[]): number {
    // Custom business logic validation
    if (operands.some(n => n < 0)) {
      throw new Error('Negative numbers not allowed in this context')
    }
    
    return super.add(...operands)
  }
}

const calc = new ValidatedCalculator()
// calc.add(-1, 5) // Would throw error
const result = calc.add(1, 5) // Works fine
```

## Batch Operations

```typescript
import { Calculator } from 'odetest'

class BatchCalculator {
  private calc = new Calculator({ precision: 3 })

  public processDataSet(numbers: number[]): {
    sum: number
    average: number
    product: number
    min: number
    max: number
  } {
    if (numbers.length === 0) {
      throw new Error('Cannot process empty dataset')
    }

    const sum = this.calc.add(...numbers)
    const average = this.calc.divide(sum, numbers.length)
    const product = this.calc.multiply(...numbers)
    const min = Math.min(...numbers)
    const max = Math.max(...numbers)

    return { sum, average, product, min, max }
  }

  public calculateStandardDeviation(numbers: number[]): number {
    const stats = this.processDataSet(numbers)
    const mean = stats.average
    
    // Calculate variance
    const squaredDiffs = numbers.map(n => 
      this.calc.power(this.calc.subtract(n, mean), 2)
    )
    const variance = this.calc.divide(
      this.calc.add(...squaredDiffs), 
      numbers.length
    )
    
    return this.calc.sqrt(variance)
  }
}

// Usage
const batchCalc = new BatchCalculator()
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const stats = batchCalc.processDataSet(data)
console.log('Sum:', stats.sum)           // 55.000
console.log('Average:', stats.average)   // 5.500
console.log('Product:', stats.product)   // 3628800.000

const stdDev = batchCalc.calculateStandardDeviation(data)
console.log('Standard Deviation:', stdDev) // ~2.872
```

## Chain Calculations

```typescript
import { Calculator, type CalculationResult } from 'odetest'

class ChainCalculator {
  private calc = new Calculator()
  private currentValue: number = 0

  public start(value: number): this {
    this.currentValue = value
    return this
  }

  public add(value: number): this {
    this.currentValue = this.calc.add(this.currentValue, value)
    return this
  }

  public multiply(value: number): this {
    this.currentValue = this.calc.multiply(this.currentValue, value)
    return this
  }

  public divide(value: number): this {
    this.currentValue = this.calc.divide(this.currentValue, value)
    return this
  }

  public power(exponent: number): this {
    this.currentValue = this.calc.power(this.currentValue, exponent)
    return this
  }

  public sqrt(): this {
    this.currentValue = this.calc.sqrt(this.currentValue)
    return this
  }

  public getValue(): number {
    return this.currentValue
  }

  public getHistory(): readonly CalculationResult[] {
    return this.calc.getHistory()
  }
}

// Usage - Calculate ((5 + 3) * 2)^2 / 4 = 64
const result = new ChainCalculator()
  .start(5)
  .add(3)      // 8
  .multiply(2) // 16
  .power(2)    // 256
  .divide(4)   // 64
  .getValue()

console.log('Result:', result) // 64
```

## Working with Math Utilities

```typescript
import { MathUtils } from 'odetest'

// Advanced number validation
const safeNumbers = [1, 2, 3, NaN, 4, 5].filter(n => 
  MathUtils.isSafeNumber(n)
) // [1, 2, 3, 4, 5]

// Precision utilities
const values = [3.14159, 2.71828, 1.41421]
const rounded = values.map(v => MathUtils.round(v, 2))
console.log(rounded) // [3.14, 2.72, 1.41]

// GCD and LCM for arrays
function arrayGcd(numbers: number[]): number {
  return numbers.reduce((gcd, num) => MathUtils.gcd(gcd, num))
}

function arrayLcm(numbers: number[]): number {
  return numbers.reduce((lcm, num) => MathUtils.lcm(lcm, num))
}

const nums = [12, 18, 24]
console.log('GCD:', arrayGcd(nums))  // 6
console.log('LCM:', arrayLcm(nums))  // 72
```

## Custom Error Handling

```typescript
import { Calculator, type CalculationError } from 'odetest'

class SafeCalculator {
  private calc = new Calculator()
  private errors: CalculationError[] = []

  public safeAdd(a: number, b: number): number | null {
    try {
      return this.calc.add(a, b)
    } catch (error) {
      this.errors.push({
        message: error.message,
        operation: 'add',
        input: [a, b]
      })
      return null
    }
  }

  public safeDivide(a: number, b: number): number | null {
    try {
      return this.calc.divide(a, b)
    } catch (error) {
      this.errors.push({
        message: error.message,
        operation: 'divide',
        input: [a, b]
      })
      return null
    }
  }

  public getErrors(): readonly CalculationError[] {
    return [...this.errors]
  }

  public clearErrors(): void {
    this.errors.length = 0
  }
}

// Usage
const safeCalc = new SafeCalculator()

const result1 = safeCalc.safeAdd(5, 3)        // 8
const result2 = safeCalc.safeDivide(10, 0)    // null
const result3 = safeCalc.safeAdd(NaN, 5)      // null

console.log('Errors:', safeCalc.getErrors().length) // 2
```

## Performance Optimization

```typescript
import { Calculator, MathUtils } from 'odetest'

class OptimizedCalculator {
  private calc = new Calculator({ enableLogging: false }) // Disable logging for performance
  private cache = new Map<string, number>()

  public cachedPower(base: number, exponent: number): number {
    const key = `${base}^${exponent}`
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }
    
    const result = this.calc.power(base, exponent)
    this.cache.set(key, result)
    return result
  }

  public efficientSum(numbers: number[]): number {
    // Pre-validate all numbers at once
    MathUtils.validateNumbers(numbers)
    
    // Use native reduce for better performance on large arrays
    let sum = 0
    for (let i = 0; i < numbers.length; i++) {
      sum += numbers[i]
    }
    
    return MathUtils.round(sum, this.calc.getOptions().precision)
  }

  public clearCache(): void {
    this.cache.clear()
  }

  public getCacheSize(): number {
    return this.cache.size
  }
}

// Performance testing
const optCalc = new OptimizedCalculator()
const largeArray = Array.from({ length: 10000 }, (_, i) => i + 1)

console.time('Efficient Sum')
const sum = optCalc.efficientSum(largeArray)
console.timeEnd('Efficient Sum')

console.log('Sum of 1-10000:', sum) // 50005000
```

## Integration Patterns

```typescript
// React Hook example (if using in a React app)
function useCalculator(initialOptions = {}) {
  const [calc] = useState(() => new Calculator(initialOptions))
  const [history, setHistory] = useState(() => calc.getHistory())

  const performCalculation = useCallback((operation: string, ...args: number[]) => {
    try {
      let result: number
      switch (operation) {
        case 'add': result = calc.add(...args); break
        case 'subtract': result = calc.subtract(args[0], args[1]); break
        case 'multiply': result = calc.multiply(...args); break
        case 'divide': result = calc.divide(args[0], args[1]); break
        default: throw new Error(`Unknown operation: ${operation}`)
      }
      
      setHistory([...calc.getHistory()])
      return result
    } catch (error) {
      console.error('Calculation error:', error.message)
      return null
    }
  }, [calc])

  return { performCalculation, history, clearHistory: () => calc.clearHistory() }
}
```
