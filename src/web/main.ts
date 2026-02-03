/**
 * Main entry point for the ODE Solver web application
 * @category Web
 */

import { ODEWebApp } from './app.js'

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Initializing ODE Solver Web Application...')
    
    // Create and initialize the app
    const app = new ODEWebApp()
    
    // Make app globally available for debugging
    if (typeof window !== 'undefined') {
      (window as any).odeApp = app
    }
    
    console.log('✅ ODE Solver initialized successfully!')
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + Enter to solve
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        const form = document.getElementById('ode-form') as HTMLFormElement
        form.dispatchEvent(new Event('submit', { cancelable: true }))
      }
      
      // Ctrl/Cmd + D to download chart
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && event.shiftKey) {
        event.preventDefault()
        app.downloadChart()
      }
      
      // Ctrl/Cmd + S to download CSV
      if ((event.ctrlKey || event.metaKey) && event.key === 's' && event.shiftKey) {
        event.preventDefault()
        app.downloadCSV()
      }
    })
    
    // Add download buttons to the UI
    addDownloadButtons(app)
    
    // Show helpful tips
    showWelcomeMessage()
    
  } catch (error) {
    console.error('❌ Failed to initialize ODE Solver:', error)
    
    // Show error to user
    const errorDiv = document.createElement('div')
    errorDiv.className = 'error-message'
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      max-width: 500px;
      padding: 1rem;
    `
    errorDiv.innerHTML = `
      <strong>❌ Application Error</strong><br>
      Failed to initialize ODE Solver: ${error instanceof Error ? error.message : 'Unknown error'}
    `
    document.body.appendChild(errorDiv)
    
    // Remove error message after 10 seconds
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv)
      }
    }, 10000)
  }
})

/**
 * Adds download buttons to the solution details section
 */
function addDownloadButtons(app: ODEWebApp): void {
  const solutionDetails = document.getElementById('solution-details')
  if (!solutionDetails) return
  
  // Create download buttons container
  const downloadContainer = document.createElement('div')
  downloadContainer.className = 'download-buttons'
  downloadContainer.style.cssText = `
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--gray-200);
  `
  
  // Chart download button
  const chartBtn = document.createElement('button')
  chartBtn.type = 'button'
  chartBtn.innerHTML = '📊 Download Chart'
  chartBtn.className = 'download-btn'
  chartBtn.style.cssText = `
    padding: 0.5rem 1rem;
    background: var(--secondary-color);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.9rem;
    transition: background var(--transition-fast);
  `
  chartBtn.addEventListener('click', () => app.downloadChart())
  chartBtn.addEventListener('mouseenter', () => {
    chartBtn.style.background = 'var(--gray-600)'
  })
  chartBtn.addEventListener('mouseleave', () => {
    chartBtn.style.background = 'var(--secondary-color)'
  })
  
  // CSV download button
  const csvBtn = document.createElement('button')
  csvBtn.type = 'button'
  csvBtn.innerHTML = '📋 Download CSV'
  csvBtn.className = 'download-btn'
  csvBtn.style.cssText = chartBtn.style.cssText
  csvBtn.addEventListener('click', () => app.downloadCSV())
  csvBtn.addEventListener('mouseenter', () => {
    csvBtn.style.background = 'var(--gray-600)'
  })
  csvBtn.addEventListener('mouseleave', () => {
    csvBtn.style.background = 'var(--secondary-color)'
  })
  
  downloadContainer.appendChild(chartBtn)
  downloadContainer.appendChild(csvBtn)
  solutionDetails.appendChild(downloadContainer)
}

/**
 * Shows welcome message with tips
 */
function showWelcomeMessage(): void {
  // Only show if no equation is pre-filled
  const equationInput = document.getElementById('equation') as HTMLInputElement
  if (equationInput.value.trim()) return
  
  const tipContainer = document.createElement('div')
  tipContainer.className = 'welcome-tips'
  tipContainer.style.cssText = `
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    padding: 1rem;
    border-radius: var(--radius-lg);
    margin-bottom: 1rem;
    position: relative;
  `
  
  tipContainer.innerHTML = `
    <h3 style="margin: 0 0 0.5rem 0; color: white;">💡 Quick Start Tips</h3>
    <ul style="margin: 0; padding-left: 1.5rem; line-height: 1.6;">
      <li>Enter equations like <code style="background: rgba(255,255,255,0.2); padding: 0.2rem 0.4rem; border-radius: 0.25rem;">x + y</code>, <code style="background: rgba(255,255,255,0.2); padding: 0.2rem 0.4rem; border-radius: 0.25rem;">sin(x) * y</code>, or <code style="background: rgba(255,255,255,0.2); padding: 0.2rem 0.4rem; border-radius: 0.25rem;">x^2 - y</code></li>
      <li>Try the example equations below to get started</li>
      <li>Use <kbd style="background: rgba(255,255,255,0.2); padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.8rem;">Ctrl+Enter</kbd> to solve quickly</li>
      <li>Runge-Kutta 4th order is recommended for best accuracy</li>
    </ul>
    <button id="close-tips" style="
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    ">×</button>
  `
  
  // Insert tips after header
  const inputSection = document.querySelector('.input-section .card')
  if (inputSection) {
    inputSection.insertBefore(tipContainer, inputSection.firstChild)
  }
  
  // Close tips handler
  const closeBtn = document.getElementById('close-tips')
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      tipContainer.remove()
      localStorage.setItem('ode-tips-closed', 'true')
    })
  }
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (document.contains(tipContainer)) {
      tipContainer.style.transition = 'opacity 0.5s ease'
      tipContainer.style.opacity = '0'
      setTimeout(() => tipContainer.remove(), 500)
    }
  }, 10000)
  
  // Don't show again if previously closed
  if (localStorage.getItem('ode-tips-closed') === 'true') {
    tipContainer.remove()
  }
}

// Handle any unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  
  // Show user-friendly error
  const errorDiv = document.createElement('div')
  errorDiv.className = 'error-message'
  errorDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
    padding: 1rem;
  `
  errorDiv.innerHTML = `
    <strong>⚠️ Computation Error</strong><br>
    ${event.reason instanceof Error ? event.reason.message : 'An unexpected error occurred'}
  `
  document.body.appendChild(errorDiv)
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(errorDiv)) {
      document.body.removeChild(errorDiv)
    }
  }, 5000)
})

// Export for potential external use
export { ODEWebApp }
