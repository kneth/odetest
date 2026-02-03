/**
 * @fileoverview Example demonstrating coupled ODE solving capabilities
 * @category Examples
 */

// This file demonstrates how to use the coupled ODE solver
// You can run this in the browser console when the app is loaded

// Example 1: Simple Harmonic Oscillator
// System: dy1/dx = y2, dy2/dx = -y1
// This represents a mass-spring system where y1 is position, y2 is velocity

async function harmonicOscillatorExample() {
  console.log('🔬 Harmonic Oscillator Example')
  console.log('System: dy1/dx = y2, dy2/dx = -y1')
  
  // Import the solver (this would work in the browser console)
  // const { CoupledODESolver } = await import('/src/ode-solver/index.js')
  
  // const solver = new CoupledODESolver()
  // const result = await solver.solve(['y2', '-y1'], {
  //   x0: 0,
  //   y0: [1, 0], // Start at position 1, velocity 0
  //   xEnd: 2 * Math.PI,
  //   stepSize: 0.1,
  //   method: 'rk4'
  // })
  
  // console.log('Result:', result)
}

// Example 2: Predator-Prey Model (Lotka-Volterra)
// System: dy1/dx = a*y1 - b*y1*y2, dy2/dx = c*y1*y2 - d*y2
// Where y1 = prey population, y2 = predator population

async function predatorPreyExample() {
  console.log('🐰🦊 Predator-Prey Example')
  console.log('Lotka-Volterra equations with realistic parameters')
  
  // Simplified version for demonstration
  // dy1/dx = 0.1*y1*(1 - y2/50)  // Prey with carrying capacity and predation
  // dy2/dx = -0.05*y2*(1 - y1/25) // Predator dynamics
}

// Example 3: Lorenz System (Chaotic)
// Famous chaotic system that exhibits strange attractors
// dy1/dx = σ(y2 - y1)
// dy2/dx = y1(ρ - y3) - y2  
// dy3/dx = y1*y2 - β*y3

async function lorenzSystemExample() {
  console.log('🌪️ Lorenz System Example (Chaos)')
  console.log('System with σ=10, ρ=28, β=8/3')
  
  // const equations = [
  //   '10 * (y2 - y1)',           // σ(y2 - y1)
  //   'y1 * (28 - y3) - y2',      // y1(ρ - y3) - y2
  //   'y1 * y2 - (8/3) * y3'      // y1*y2 - β*y3
  // ]
  
  // Initial conditions: (1, 1, 1)
  // Time span: 0 to 25
}

export {
  harmonicOscillatorExample,
  predatorPreyExample,
  lorenzSystemExample
}
