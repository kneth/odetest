# Basic Usage

Learn how to use OdeTest for common mathematical calculations.

## Creating a Calculator

```typescript
import { Calculator } from 'odetest'

// Default configuration
const calc = new Calculator()

// Custom configuration
const customCalc = new Calculator({
  precision: 4,
  enableLogging: true,
  maxValue: 1000000
})
```

## Basic Operations

### Addition

```typescript
const calc = new Calculator()

// Add two numbers
const result1 = calc.add(5, 3) // 8

// Add multiple numbers
const result2 = calc.add(1, 2, 3, 4, 5) // 15

// Add decimal numbers
const result3 = calc.add(1.5, 2.7) // 4.2
```

### Subtraction

```typescript
const calc = new Calculator()

const result = calc.subtract(10, 3) // 7
const negative = calc.subtract(5, 8) // -3
```

### Multiplication

```typescript
const calc = new Calculator()

// Multiply two numbers
const result1 = calc.multiply(4, 5) // 20

// Multiply multiple numbers
const result2 = calc.multiply(2, 3, 4) // 24

// Multiply by zero
const result3 = calc.multiply(5, 0) // 0
```

### Division

```typescript
const calc = new Calculator()

const result1 = calc.divide(15, 3) // 5
const result2 = calc.divide(10, 4) // 2.5

// Division by zero throws an error
try {
  calc.divide(10, 0)
} catch (error) {
  console.error(error.message) // "Division by zero is not allowed"
}
```

### Power and Square Root

```typescript
const calc = new Calculator()

// Power operations
const squared = calc.power(5, 2) // 25
const cubed = calc.power(3, 3) // 27
const negativeExp = calc.power(2, -2) // 0.25

// Square root
const sqrt1 = calc.sqrt(9) // 3
const sqrt2 = calc.sqrt(2) // 1.41

// Square root of negative number throws an error
try {
  calc.sqrt(-4)
} catch (error) {
  console.error(error.message) // "Cannot calculate square root of negative number"
}
```

## Working with Results

### Precision Control

```typescript
// High precision calculator
const preciseCalc = new Calculator({ precision: 5 })

const result = preciseCalc.divide(1, 3) // 0.33333

// Low precision calculator
const roughCalc = new Calculator({ precision: 0 })

const rounded = roughCalc.divide(7, 2) // 4
```

### Calculation History

```typescript
const calc = new Calculator()

// Perform some calculations
calc.add(2, 3)
calc.multiply(4, 5)
calc.subtract(10, 2)

// Get history
const history = calc.getHistory()
console.log(`Performed ${history.length} calculations`)

// Inspect individual results
history.forEach((result, index) => {
  console.log(`${index + 1}. ${result.operation}(${result.operands.join(', ')}) = ${result.value}`)
  console.log(`   Calculated at: ${result.timestamp}`)
})

// Clear history when needed
calc.clearHistory()
```

### Configuration Management

```typescript
const calc = new Calculator({ precision: 2, enableLogging: true })

// Get current configuration
const options = calc.getOptions()
console.log('Precision:', options.precision)
console.log('Logging enabled:', options.enableLogging)
console.log('Max value:', options.maxValue)
```

## Next Steps

- Check out [Advanced Features](./advanced-features.md) for more complex usage
- Learn about [Error Handling](./error-handling.md) best practices
- Explore the [Math Utilities](../guide/math-utils.md) for additional functions
