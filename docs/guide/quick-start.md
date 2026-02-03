# Quick Start

Get up and running with OdeTest in minutes!

## Basic Usage

```typescript
import { Calculator } from 'odetest'

// Create a new calculator
const calc = new Calculator()

// Perform basic operations
const sum = calc.add(5, 3) // 8
const product = calc.multiply(4, 6) // 24
const quotient = calc.divide(10, 2) // 5

console.log(`Results: ${sum}, ${product}, ${quotient}`)
```

## Configuration

Customize the calculator behavior:

```typescript
import { Calculator } from 'odetest'

const calc = new Calculator({
  precision: 3, // Round to 3 decimal places
  enableLogging: true, // Enable console logging
  maxValue: 1000000, // Set maximum allowed value
})

const result = calc.add(1.234, 5.678) // 6.912
```

## Working with History

Track your calculations:

```typescript
const calc = new Calculator()

calc.add(2, 3)
calc.multiply(4, 5)
calc.subtract(10, 1)

// Get calculation history
const history = calc.getHistory()
console.log(`Performed ${history.length} calculations`)

// Clear history
calc.clearHistory()
```

## Error Handling

Handle errors gracefully:

```typescript
const calc = new Calculator()

try {
  calc.divide(5, 0) // Will throw an error
} catch (error) {
  console.error('Calculation error:', error.message)
}

try {
  calc.sqrt(-4) // Will throw an error
} catch (error) {
  console.error('Invalid operation:', error.message)
}
```

## Math Utilities

Use the utility functions:

```typescript
import { MathUtils } from 'odetest'

// Round numbers
const rounded = MathUtils.round(3.14159, 2) // 3.14

// Validate numbers
const isValid = MathUtils.isSafeNumber(42) // true

// Calculate GCD and LCM
const gcd = MathUtils.gcd(12, 18) // 6
const lcm = MathUtils.lcm(4, 6) // 12
```

## Testing Your Code

Write tests for your calculator usage:

```typescript
import { describe, expect, it } from 'vitest'
import { Calculator } from 'odetest'

describe('My Calculator Tests', () => {
  it('should calculate correctly', () => {
    const calc = new Calculator()
    expect(calc.add(2, 3)).toBe(5)
    expect(calc.multiply(4, 5)).toBe(20)
  })
})
```

## Next Steps

- Explore the [API Reference](/api/) for detailed documentation
- Check out more [Examples](/examples/) for advanced usage
- Learn about [Configuration](./configuration.md) options
