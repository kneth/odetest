/**
 * Test script to verify coupled ODE functionality
 */

import { CoupledODESolver } from './src/ode-solver/index.js'

async function testCoupledODE() {
  console.log('🧪 Testing Coupled ODE Solver...')
  
  const solver = new CoupledODESolver()
  
  // Test 1: Simple harmonic oscillator
  console.log('\n📍 Test 1: Harmonic Oscillator (dy1/dx = y2, dy2/dx = -y1)')
  
  const result1 = await solver.solve(['y2', '-y1'], {
    x0: 0,
    y0: [1, 0], // Initial position and velocity
    xEnd: 2 * Math.PI,
    stepSize: 0.1,
    method: 'rk4'
  })
  
  if (result1.success) {
    console.log(`✅ Success! Computed ${result1.points.length} points`)
    console.log(`⏱️ Computation time: ${result1.computationTime.toFixed(2)}ms`)
    
    // Check if the solution is periodic (should return to initial state)
    const lastPoint = result1.points[result1.points.length - 1]
    if (lastPoint) {
      console.log(`🎯 Final state: y1=${lastPoint.y[0]?.toFixed(3)}, y2=${lastPoint.y[1]?.toFixed(3)}`)
      console.log(`🎯 Expected: y1≈1, y2≈0 (periodic solution)`)
    }
  } else {
    console.log(`❌ Failed: ${result1.error}`)
  }
  
  // Test 2: Simple predator-prey model
  console.log('\n📍 Test 2: Predator-Prey Model')
  
  const result2 = await solver.solve([
    '0.1 * y1 * (1 - y2/50)', // Prey growth with predation
    '-0.05 * y2 * (1 - y1/25)'  // Predator dynamics
  ], {
    x0: 0,
    y0: [10, 5], // Initial prey and predator populations
    xEnd: 50,
    stepSize: 0.1,
    method: 'rk4'
  })
  
  if (result2.success) {
    console.log(`✅ Success! Computed ${result2.points.length} points`)
    console.log(`⏱️ Computation time: ${result2.computationTime.toFixed(2)}ms`)
    
    const finalPoint = result2.points[result2.points.length - 1]
    if (finalPoint) {
      console.log(`🐰 Final prey population: ${finalPoint.y[0]?.toFixed(2)}`)
      console.log(`🦊 Final predator population: ${finalPoint.y[1]?.toFixed(2)}`)
    }
  } else {
    console.log(`❌ Failed: ${result2.error}`)
  }
  
  // Test 3: Validation
  console.log('\n📍 Test 3: Equation Validation')
  
  const validation = solver.validateEquations(['y2', 'invalid_func(y1)'])
  console.log(`Validation result: ${validation.valid ? '✅ Valid' : `❌ Invalid: ${validation.error}`}`)
  
  console.log('\n🎉 Coupled ODE tests completed!')
}

// Run the test
testCoupledODE().catch(console.error)
