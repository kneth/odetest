// Simple test of coupled ODE functionality using built files
console.log('🧪 Testing Coupled ODE Solver from built files...')

// This would be run in the browser console after loading the app
const testCoupledODE = async () => {
  try {
    // Import from the built application
    const { CoupledODESolver } = window.odeApp || {}
    
    if (!CoupledODESolver) {
      console.error('❌ CoupledODESolver not available')
      return
    }
    
    const solver = new CoupledODESolver()
    
    // Test harmonic oscillator
    console.log('📍 Testing Harmonic Oscillator...')
    const result = await solver.solve(['y2', '-y1'], {
      x0: 0,
      y0: [1, 0],
      xEnd: 6.28,  // 2π
      stepSize: 0.1,
      method: 'rk4'
    })
    
    if (result.success) {
      console.log(`✅ Success! ${result.points.length} points computed`)
      console.log(`⏱️ Time: ${result.computationTime.toFixed(2)}ms`)
      
      const lastPoint = result.points[result.points.length - 1]
      console.log(`🎯 Final: [${lastPoint?.y.map(v => v.toFixed(3)).join(', ')}]`)
      console.log(`🎯 Expected: [~1, ~0] (periodic solution)`)
    } else {
      console.log(`❌ Failed: ${result.error}`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Instructions for browser testing
console.log('💡 To test in browser:')
console.log('1. Load the application at http://localhost:3000')
console.log('2. Open browser console')
console.log('3. Call: testCoupledODE()')

export { testCoupledODE }
