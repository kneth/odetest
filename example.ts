/**
 * Example usage of the OdeTest calculator library
 */

import { Calculator, MathUtils } from './src/index.js'

function main(): void {
  console.log('🧮 OdeTest Calculator Example\n')

  // Create a calculator with custom options
  const calc = new Calculator({
    precision: 3,
    enableLogging: true,
    maxValue: 1000000,
  })

  console.log('📋 Calculator Configuration:')
  console.log(JSON.stringify(calc.getOptions(), null, 2))
  console.log()

  // Perform various calculations
  console.log('🔢 Basic Operations:')
  const sum = calc.add(15.678, 23.456, 7.891)
  console.log(`Addition: 15.678 + 23.456 + 7.891 = ${sum}`)

  const difference = calc.subtract(100.5, 23.75)
  console.log(`Subtraction: 100.5 - 23.75 = ${difference}`)

  const product = calc.multiply(3.14159, 2.5)
  console.log(`Multiplication: 3.14159 × 2.5 = ${product}`)

  const quotient = calc.divide(22, 7)
  console.log(`Division: 22 ÷ 7 = ${quotient}`)

  const squared = calc.power(5, 2)
  console.log(`Power: 5² = ${squared}`)

  const squareRoot = calc.sqrt(144)
  console.log(`Square root: √144 = ${squareRoot}`)
  console.log()

  // Demonstrate math utilities
  console.log('🛠️ Math Utilities:')
  const rounded = MathUtils.round(3.14159265359, 4)
  console.log(`Rounding π to 4 decimals: ${rounded}`)

  const gcd = MathUtils.gcd(48, 18)
  console.log(`GCD of 48 and 18: ${gcd}`)

  const lcm = MathUtils.lcm(12, 15)
  console.log(`LCM of 12 and 15: ${lcm}`)

  console.log(`Is 42 a safe number? ${MathUtils.isSafeNumber(42)}`)
  console.log(`Is NaN a safe number? ${MathUtils.isSafeNumber(NaN)}`)
  console.log()

  // Show calculation history
  console.log('📜 Calculation History:')
  const history = calc.getHistory()
  history.forEach((result, index) => {
    const operandsStr = result.operands.join(', ')
    console.log(
      `${index + 1}. ${result.operation}(${operandsStr}) = ${result.value} (${result.timestamp.toISOString()})`
    )
  })
  console.log()

  // Demonstrate error handling
  console.log('❌ Error Handling Examples:')
  
  try {
    calc.divide(10, 0)
  } catch (error) {
    console.log(`Division by zero: ${error.message}`)
  }

  try {
    calc.sqrt(-4)
  } catch (error) {
    console.log(`Negative square root: ${error.message}`)
  }

  try {
    calc.add(1, NaN)
  } catch (error) {
    console.log(`Invalid number: ${error.message}`)
  }

  console.log('\n✨ Example completed successfully!')
}

// Run the example
main()
