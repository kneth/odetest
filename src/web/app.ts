/**
 * Web application controller for ODE solver interface
 * Supports both single ODEs and coupled systems of ODEs
 * @category Web
 */

import { CoupledODESolver, ODESolver } from '@/ode-solver/index.js'
import { SolutionChart } from './chart.js'
import type { 
  CoupledODESolution, 
  CoupledSolutionPoint, 
  ODESolution, 
  SolutionPoint 
} from '@/ode-solver/types.js'

/**
 * Interface for equation input data
 */
interface EquationEntry {
  id: string
  equation: string
  variable: string
  initialValue: number
}

/**
 * Main application controller
 * @public
 */
export class ODEWebApp {
  private solver: ODESolver
  private coupledSolver: CoupledODESolver
  private chart: SolutionChart | null = null
  private currentSolution: ODESolution | CoupledODESolution | null = null
  private currentMode: 'single' | 'coupled' = 'single'
  private equations: EquationEntry[] = []
  private nextEquationId = 1

  // DOM elements
  private coupledModeToggle!: HTMLInputElement
  private singleModePanel!: HTMLElement
  private coupledModePanel!: HTMLElement
  
  // Single mode elements
  private singleForm!: HTMLFormElement
  private singleEquationInput!: HTMLInputElement
  private singleT0Input!: HTMLInputElement
  private singleY0Input!: HTMLInputElement
  private singleTEndInput!: HTMLInputElement
  private singleStepInput!: HTMLInputElement
  private singleMethodSelect!: HTMLSelectElement
  
  // Coupled mode elements
  private coupledForm!: HTMLFormElement
  private coupledT0Input!: HTMLInputElement
  private coupledTEndInput!: HTMLInputElement
  private coupledStepInput!: HTMLInputElement
  private coupledMethodSelect!: HTMLSelectElement
  private addEquationBtn!: HTMLButtonElement
  private equationsContainer!: HTMLElement
  private initialConditionsContainer!: HTMLElement

  // Result elements
  private loadingDiv!: HTMLElement
  private errorDiv!: HTMLElement
  private chartContainer!: HTMLElement
  private solutionDetails!: HTMLElement
  private canvas!: HTMLCanvasElement

  constructor() {
    this.solver = new ODESolver()
    this.coupledSolver = new CoupledODESolver()
    this.initializeDOM()
    this.attachEventListeners()
    this.setupExampleButtons()
    this.initializeDefaultEquations()
  }

  /**
   * Initializes DOM element references
   * @private
   */
  private initializeDOM(): void {
    // Helper function to get element with validation
    const getRequiredElement = <T extends HTMLElement>(id: string, type?: string): T => {
      const element = document.getElementById(id) as T | null
      if (!element) {
        const typeText = type !== null && type !== undefined && type.trim() !== '' ? ` (expected ${type})` : ''
        throw new Error(`Required element with ID '${id}' not found${typeText}`)
      }
      return element
    }

    try {
      // Mode toggle
      this.coupledModeToggle = getRequiredElement<HTMLInputElement>('coupled-mode-toggle', 'input')
      this.singleModePanel = getRequiredElement<HTMLElement>('single-ode-mode', 'div')
      this.coupledModePanel = getRequiredElement<HTMLElement>('coupled-ode-mode', 'div')

      // Single mode elements
      this.singleForm = getRequiredElement<HTMLFormElement>('single-ode-form', 'form')
      this.singleEquationInput = getRequiredElement<HTMLInputElement>('single-equation', 'input')
      this.singleT0Input = getRequiredElement<HTMLInputElement>('single-t0', 'input')
      this.singleY0Input = getRequiredElement<HTMLInputElement>('single-y0', 'input')
      this.singleTEndInput = getRequiredElement<HTMLInputElement>('single-tend', 'input')
      this.singleStepInput = getRequiredElement<HTMLInputElement>('single-step', 'input')
      this.singleMethodSelect = getRequiredElement<HTMLSelectElement>('single-method', 'select')

      // Coupled mode elements
      this.coupledForm = getRequiredElement<HTMLFormElement>('coupled-ode-form', 'form')
      this.coupledT0Input = getRequiredElement<HTMLInputElement>('coupled-t0', 'input')
      this.coupledTEndInput = getRequiredElement<HTMLInputElement>('coupled-tend', 'input')
      this.coupledStepInput = getRequiredElement<HTMLInputElement>('coupled-step', 'input')
      this.coupledMethodSelect = getRequiredElement<HTMLSelectElement>('coupled-method', 'select')
      this.addEquationBtn = getRequiredElement<HTMLButtonElement>('add-equation-btn', 'button')
      this.equationsContainer = getRequiredElement<HTMLElement>('equations-container', 'div')
      this.initialConditionsContainer = getRequiredElement<HTMLElement>('initial-conditions-list', 'div')

      // Result elements
      this.loadingDiv = getRequiredElement<HTMLElement>('loading', 'div')
      this.errorDiv = getRequiredElement<HTMLElement>('error-message', 'div')
      this.chartContainer = getRequiredElement<HTMLElement>('chart-container', 'div')
      this.solutionDetails = getRequiredElement<HTMLElement>('solution-details', 'div')
      this.canvas = getRequiredElement<HTMLCanvasElement>('solution-chart', 'canvas')
    } catch (error) {
      throw new Error(`Failed to initialize DOM elements: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Attaches event listeners
   * @private
   */
  private attachEventListeners(): void {
    // Mode toggle
    this.coupledModeToggle.addEventListener('change', () => this.handleModeToggle())

    // Single mode
    this.singleForm.addEventListener('submit', (e) => {
      void this.handleSingleFormSubmit(e)
    })
    this.singleEquationInput.addEventListener('input', () => this.validateSingleEquation())

    // Coupled mode
    this.coupledForm.addEventListener('submit', (e) => {
      void this.handleCoupledFormSubmit(e)
    })
    this.addEquationBtn.addEventListener('click', () => this.addEquation())

    // Initialize with single mode
    this.updateModeUI()
  }

  /**
   * Sets up example equation buttons
   * @private
   */
  private setupExampleButtons(): void {
    const exampleButtons = document.querySelectorAll('.example-btn')
    
    exampleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const type = button.getAttribute('data-type')!
        
        if (type === 'single') {
          this.loadSingleExample(button)
        } else if (type === 'coupled') {
          this.loadCoupledExample(button)
        }
      })
    })
  }

  /**
   * Loads a single ODE example
   * @private
   */
  private loadSingleExample(button: Element): void {
    const equation = button.getAttribute('data-equation')!
    const t0 = parseFloat(button.getAttribute('data-t0')!)
    const y0 = parseFloat(button.getAttribute('data-y0')!)
    const tEnd = parseFloat(button.getAttribute('data-tend')!)

    this.currentMode = 'single'
    this.coupledModeToggle.checked = false
    this.updateModeUI()

    this.singleEquationInput.value = equation
    this.singleT0Input.value = t0.toString()
    this.singleY0Input.value = y0.toString()
    this.singleTEndInput.value = tEnd.toString()
    
    this.clearResults()
  }

  /**
   * Loads a coupled system example
   * @private
   */
  private loadCoupledExample(button: Element): void {
    const equations = JSON.parse(button.getAttribute('data-equations')!) as string[]
    const t0 = parseFloat(button.getAttribute('data-t0')!)
    const y0 = JSON.parse(button.getAttribute('data-y0')!) as number[]
    const tEnd = parseFloat(button.getAttribute('data-tend')!)

    this.currentMode = 'coupled'
    this.coupledModeToggle.checked = true
    this.updateModeUI()

    this.coupledT0Input.value = t0.toString()
    this.coupledTEndInput.value = tEnd.toString()

    // Clear existing equations
    this.equations = []
    this.equationsContainer.innerHTML = ''
    this.initialConditionsContainer.innerHTML = ''

    // Add the example equations
    equations.forEach((eq, index) => {
      const initialValue = y0[index] ?? 0
      this.addEquation(eq, initialValue)
    })

    this.clearResults()
  }

  /**
   * Handles mode toggle between single and coupled
   * @private
   */
  private handleModeToggle(): void {
    this.currentMode = this.coupledModeToggle.checked ? 'coupled' : 'single'
    this.updateModeUI()
    this.clearResults()
  }

  /**
   * Updates UI based on current mode
   * @private
   */
  private updateModeUI(): void {
    if (this.currentMode === 'single') {
      this.singleModePanel.classList.remove('hidden')
      this.coupledModePanel.classList.add('hidden')
      
      // Update toggle labels
      document.querySelector('[data-mode="single"]')?.classList.add('active')
      document.querySelector('[data-mode="coupled"]')?.classList.remove('active')
      
      // Update examples visibility
      document.getElementById('single-examples')?.classList.remove('hidden')
      document.getElementById('coupled-examples')?.classList.add('hidden')
    } else {
      this.singleModePanel.classList.add('hidden')
      this.coupledModePanel.classList.remove('hidden')
      
      // Update toggle labels
      document.querySelector('[data-mode="single"]')?.classList.remove('active')
      document.querySelector('[data-mode="coupled"]')?.classList.add('active')
      
      // Update examples visibility
      document.getElementById('single-examples')?.classList.add('hidden')
      document.getElementById('coupled-examples')?.classList.remove('hidden')
    }
  }

  /**
   * Initializes default equations for coupled mode
   * @private
   */
  private initializeDefaultEquations(): void {
    // Start with a simple 2-equation system
    this.addEquation('y2', 1)     // dy1/dt = y2, y1(0) = 1
    this.addEquation('-y1', 0)    // dy2/dt = -y1, y2(0) = 0
  }

  /**
   * Adds a new equation to the coupled system
   * @private
   */
  private addEquation(equation = '', initialValue = 0): void {
    const id = `eq_${this.nextEquationId++}`
    const variable = `y${this.equations.length + 1}`
    
    const equationEntry: EquationEntry = {
      id,
      equation,
      variable,
      initialValue
    }
    
    this.equations.push(equationEntry)
    this.renderEquationInput(equationEntry)
    this.renderInitialCondition(equationEntry)
  }

  /**
   * Renders equation input UI
   * @private
   */
  private renderEquationInput(entry: EquationEntry): void {
    const div = document.createElement('div')
    div.className = 'equation-input'
    div.setAttribute('data-id', entry.id)
    
    div.innerHTML = `
      <div class="equation-row">
        <label class="equation-label">d${entry.variable}/dt =</label>
        <input 
          type="text" 
          class="equation-field" 
          placeholder="e.g., ${entry.variable === 'y1' ? 'y2' : 'sin(t) - y1'}"
          value="${entry.equation}"
          data-variable="${entry.variable}"
        >
        <button type="button" class="remove-equation-btn" title="Remove equation">
          ❌
        </button>
      </div>
      <small class="equation-hint">Variables: t, ${this.equations.map(e => e.variable).join(', ')}</small>
    `
    
    this.equationsContainer.appendChild(div)
    
    // Attach event listeners
    const input = div.querySelector('.equation-field') as HTMLInputElement
    const removeBtn = div.querySelector('.remove-equation-btn') as HTMLButtonElement
    
    input.addEventListener('input', () => this.updateEquation(entry.id, input.value))
    removeBtn.addEventListener('click', () => this.removeEquation(entry.id))
  }

  /**
   * Renders initial condition input
   * @private
   */
  private renderInitialCondition(entry: EquationEntry): void {
    const div = document.createElement('div')
    div.className = 'initial-condition'
    div.setAttribute('data-id', entry.id)
    
    div.innerHTML = `
      <label>${entry.variable}(t₀) =</label>
      <input 
        type="number" 
        step="0.1" 
        value="${entry.initialValue}"
        class="initial-value-input"
      >
    `
    
    this.initialConditionsContainer.appendChild(div)
    
    // Attach event listener
    const input = div.querySelector('.initial-value-input') as HTMLInputElement
    input.addEventListener('input', () => {
      const value = parseFloat(input.value)
      entry.initialValue = Number.isFinite(value) ? value : 0
    })
  }

  /**
   * Updates an equation
   * @private
   */
  private updateEquation(id: string, equation: string): void {
    const entry = this.equations.find(e => e.id === id)
    if (entry) {
      entry.equation = equation
    }
  }

  /**
   * Removes an equation from the system
   * @private
   */
  private removeEquation(id: string): void {
    if (this.equations.length <= 1) {
      this.showError('Cannot remove the last equation. A system must have at least one equation.')
      return
    }
    
    this.equations = this.equations.filter(e => e.id !== id)
    
    // Remove from UI
    const equationDiv = this.equationsContainer.querySelector(`[data-id="${id}"]`)
    const conditionDiv = this.initialConditionsContainer.querySelector(`[data-id="${id}"]`)
    
    equationDiv?.remove()
    conditionDiv?.remove()
    
    // Update variable names and hints
    this.equations.forEach((entry, index) => {
      entry.variable = `y${index + 1}`
    })
    
    this.rerenderEquations()
  }

  /**
   * Re-renders all equations to update variable names
   * @private
   */
  private rerenderEquations(): void {
    this.equationsContainer.innerHTML = ''
    this.initialConditionsContainer.innerHTML = ''
    
    this.equations.forEach(entry => {
      this.renderEquationInput(entry)
      this.renderInitialCondition(entry)
    })
  }

  /**
   * Handles single ODE form submission
   * @private
   */
  private async handleSingleFormSubmit(event: Event): Promise<void> {
    event.preventDefault()
    
    this.showLoading()
    this.clearError()

    try {
      const options = {
        t0: parseFloat(this.singleT0Input.value),
        y0: parseFloat(this.singleY0Input.value),
        tEnd: parseFloat(this.singleTEndInput.value),
        stepSize: parseFloat(this.singleStepInput.value),
        method: this.singleMethodSelect.value as 'euler' | 'rk4' | 'heun'
      }

      const solution = await this.solver.solve(this.singleEquationInput.value.trim(), options)
      
      if (solution.success) {
        this.displaySingleSolution(solution)
      } else {
        this.showError(solution.error ?? 'Unknown error occurred')
      }
    } catch (error) {
      this.showError(`Computation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    this.hideLoading()
  }

  /**
   * Handles coupled system form submission
   * @private
   */
  private async handleCoupledFormSubmit(event: Event): Promise<void> {
    event.preventDefault()
    
    if (this.equations.length === 0) {
      this.showError('Please add at least one equation to the system.')
      return
    }

    // Validate all equations are filled
    const emptyEquations = this.equations.filter(eq => !eq.equation.trim())
    if (emptyEquations.length > 0) {
      this.showError('Please fill in all equation fields.')
      return
    }

    this.showLoading()
    this.clearError()

    try {
      const options = {
        t0: parseFloat(this.coupledT0Input.value),
        y0: this.equations.map(eq => eq.initialValue),
        tEnd: parseFloat(this.coupledTEndInput.value),
        stepSize: parseFloat(this.coupledStepInput.value),
        method: this.coupledMethodSelect.value as 'euler' | 'rk4' | 'heun'
      }

      const equations = this.equations.map(eq => eq.equation.trim())
      const solution = await this.coupledSolver.solve(equations, options)
      
      if (solution.success) {
        this.displayCoupledSolution(solution)
      } else {
        this.showError(solution.error ?? 'Unknown error occurred')
      }
    } catch (error) {
      this.showError(`Computation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    this.hideLoading()
  }

  /**
   * Displays single ODE solution
   * @private
   */
  private displaySingleSolution(solution: ODESolution): void {
    this.currentSolution = solution

    // Initialize chart if needed
    this.chart ??= new SolutionChart(this.canvas)

    // Display chart
    this.chart.display(solution.points, this.singleEquationInput.value, solution.method)
    this.chartContainer.classList.remove('hidden')

    // Update solution details
    this.updateSingleSolutionDetails(solution)
    this.solutionDetails.classList.remove('hidden')

    // Update data table
    this.updateSingleDataTable(solution.points)
  }

  /**
   * Displays coupled system solution
   * @private
   */
  private displayCoupledSolution(solution: CoupledODESolution): void {
    this.currentSolution = solution

    // Initialize chart if needed
    this.chart ??= new SolutionChart(this.canvas)

    // Display chart
    const equations = this.equations.map(eq => eq.equation)
    this.chart.displayCoupled(solution.points, equations, solution.method)
    this.chartContainer.classList.remove('hidden')

    // Update solution details
    this.updateCoupledSolutionDetails(solution)
    this.solutionDetails.classList.remove('hidden')

    // Update data table
    this.updateCoupledDataTable(solution.points)
  }

  /**
   * Updates solution details for single ODE
   * @private
   */
  private updateSingleSolutionDetails(solution: ODESolution): void {
    document.getElementById('points-count')!.textContent = solution.metadata.totalPoints.toString()
    const lastPoint = solution.points[solution.points.length - 1]
    const finalValue = lastPoint ? lastPoint.y.toFixed(6) : 'N/A'
    document.getElementById('final-value')!.textContent = finalValue
    document.getElementById('method-used')!.textContent = solution.method
    document.getElementById('computation-time')!.textContent = `${solution.computationTime.toFixed(2)}ms`
  }

  /**
   * Updates solution details for coupled system
   * @private
   */
  private updateCoupledSolutionDetails(solution: CoupledODESolution): void {
    const lastPoint = solution.points[solution.points.length - 1]
    const finalValues = lastPoint ? 
      lastPoint.y.map((val, i) => `y${i+1}=${val.toFixed(6)}`).join(', ') : 
      'N/A'

    document.getElementById('points-count')!.textContent = solution.metadata.totalPoints.toString()
    document.getElementById('final-value')!.textContent = finalValues
    document.getElementById('method-used')!.textContent = solution.method
    document.getElementById('computation-time')!.textContent = `${solution.computationTime.toFixed(2)}ms`
  }

  /**
   * Updates data table for single ODE
   * @private
   */
  private updateSingleDataTable(points: SolutionPoint[]): void {
    const table = document.getElementById('solution-table') as HTMLTableElement
    const tbody = document.getElementById('solution-table-body') as HTMLTableSectionElement
    
    // Update table headers
    table.querySelector('thead tr')!.innerHTML = `
      <th>t</th>
      <th>y</th>
      <th>dy/dt</th>
    `
    
    tbody.innerHTML = ''

    // Show every nth point to avoid overwhelming the table
    const step = Math.max(1, Math.floor(points.length / 100))

    for (let i = 0; i < points.length; i += step) {
      const point = points[i]
      if (!point) continue
      const row = tbody.insertRow()
      
      row.insertCell().textContent = point.t.toFixed(6)
      row.insertCell().textContent = point.y.toFixed(6)
      row.insertCell().textContent = point.dydt.toFixed(6)
    }

    // Always include the last point if not already included
    if ((points.length - 1) % step !== 0 && points.length > 1) {
      const lastPoint = points[points.length - 1]
      if (lastPoint) {
        const row = tbody.insertRow()
        
        row.insertCell().textContent = lastPoint.t.toFixed(6)
        row.insertCell().textContent = lastPoint.y.toFixed(6)
        row.insertCell().textContent = lastPoint.dydt.toFixed(6)
      }
    }
  }

  /**
   * Updates data table for coupled system
   * @private
   */
  private updateCoupledDataTable(points: CoupledSolutionPoint[]): void {
    const table = document.getElementById('solution-table') as HTMLTableElement
    const tbody = document.getElementById('solution-table-body') as HTMLTableSectionElement
    
    if (points.length === 0) return

    const firstPoint = points[0]
    if (!firstPoint) return
    
    const numVars = firstPoint.y.length
    
    // Update table headers
    const headers = ['t', ...Array.from({length: numVars}, (_, i) => `y${i+1}`)]
    table.querySelector('thead tr')!.innerHTML = headers.map(h => `<th>${h}</th>`).join('')
    
    tbody.innerHTML = ''

    // Show every nth point to avoid overwhelming the table
    const step = Math.max(1, Math.floor(points.length / 100))

    for (let i = 0; i < points.length; i += step) {
      const point = points[i]
      if (!point) continue
      const row = tbody.insertRow()
      
      row.insertCell().textContent = point.t.toFixed(6)
      point.y.forEach(val => {
        row.insertCell().textContent = val.toFixed(6)
      })
    }

    // Always include the last point if not already included
    if ((points.length - 1) % step !== 0 && points.length > 1) {
      const lastPoint = points[points.length - 1]
      if (lastPoint) {
        const row = tbody.insertRow()
        
        row.insertCell().textContent = lastPoint.t.toFixed(6)
        lastPoint.y.forEach(val => {
          row.insertCell().textContent = val.toFixed(6)
        })
      }
    }
  }

  /**
   * Validates single equation in real-time
   * @private
   */
  private validateSingleEquation(): void {
    const equation = this.singleEquationInput.value.trim()
    if (!equation) return

    const validation = this.solver.validateEquation(equation)
    
    if (validation.valid) {
      this.singleEquationInput.style.borderColor = '#10b981'
      this.clearError()
    } else {
      this.singleEquationInput.style.borderColor = '#ef4444'
      this.showError(`Invalid equation: ${validation.error}`)
    }
  }

  /**
   * Shows loading state
   * @private
   */
  private showLoading(): void {
    this.loadingDiv.classList.remove('hidden')
    this.clearResults()
  }

  /**
   * Hides loading state
   * @private
   */
  private hideLoading(): void {
    this.loadingDiv.classList.add('hidden')
  }

  /**
   * Shows error message
   * @private
   */
  private showError(message: string): void {
    this.errorDiv.textContent = message
    this.errorDiv.classList.remove('hidden')
  }

  /**
   * Clears error message
   * @private
   */
  private clearError(): void {
    this.errorDiv.classList.add('hidden')
    this.errorDiv.textContent = ''
    
    // Reset input border colors
    this.singleEquationInput.style.borderColor = ''
  }

  /**
   * Clears all results
   * @private
   */
  private clearResults(): void {
    this.chartContainer.classList.add('hidden')
    this.solutionDetails.classList.add('hidden')
    
    if (this.chart) {
      this.chart.clear()
    }
    
    this.currentSolution = null
  }

  /**
   * Gets current solution
   * @public
   */
  public getCurrentSolution(): ODESolution | CoupledODESolution | null {
    return this.currentSolution
  }

  /**
   * Downloads current solution as CSV
   * @public
   */
  public downloadCSV(): void {
    if (!this.currentSolution) return

    if ('points' in this.currentSolution && this.currentSolution.points.length > 0) {
      // Check if it's a single ODE or coupled system
      const firstPoint = this.currentSolution.points[0]
      if (!firstPoint) return
      
      if ('dydt' in firstPoint && typeof firstPoint.dydt === 'number') {
        // Single ODE
        const solution = this.currentSolution as ODESolution
        const csvContent = [
          't,y,dy/dt',
          ...solution.points.map(p => `${p.t},${p.y},${p.dydt}`)
        ].join('\n')
        this.downloadFile(csvContent, 'ode-solution.csv', 'text/csv')
      } else if ('y' in firstPoint && Array.isArray(firstPoint.y)) {
        // Coupled system
        const solution = this.currentSolution as CoupledODESolution
        const numVars = firstPoint.y.length
        const headers = ['t', ...Array.from({length: numVars}, (_, i) => `y${i+1}`)]
        const csvContent = [
          headers.join(','),
          ...solution.points.map(p => `${p.t},${p.y.join(',')}`)
        ].join('\n')
        this.downloadFile(csvContent, 'coupled-ode-solution.csv', 'text/csv')
      }
    }
  }

  /**
   * Downloads current chart as image
   * @public
   */
  public downloadChart(): void {
    if (this.chart) {
      this.chart.downloadAsImage('ode-solution.png')
    }
  }

  /**
   * Helper method to download files
   * @private
   */
  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    
    URL.revokeObjectURL(url)
  }
}
