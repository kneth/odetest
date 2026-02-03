/**
 * Chart visualization for ODE solutions
 * @category Web
 */

import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import type { CoupledSolutionPoint, SolutionPoint } from '@/ode-solver/types.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend
)

/**
 * Manages chart visualization for ODE solutions
 * @public
 */
export class SolutionChart {
  private chart: Chart | null = null
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  /**
   * Creates or updates the chart with solution data
   * @param points - Array of solution points
   * @param equation - The equation being displayed
   * @param method - The numerical method used
   */
  public display(points: SolutionPoint[], equation: string, method: string): void {
    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }

    // Prepare data
    const data: ChartData<'line'> = {
      labels: points.map(p => p.t.toFixed(3)),
      datasets: [
        {
          label: `y(t) - Solution using ${method}`,
          data: points.map(p => ({ x: p.t, y: p.y })),
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 2,
          pointRadius: points.length > 100 ? 0 : 2,
          pointBackgroundColor: 'rgb(37, 99, 235)',
          fill: false,
          tension: 0.1
        },
        {
          label: `dy/dt - Derivative`,
          data: points.map(p => ({ x: p.t, y: p.dydt })),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 1,
          pointRadius: 0,
          borderDash: [5, 5],
          fill: false,
          tension: 0.1,
          yAxisID: 'y1'
        }
      ]
    }

    // Chart options
    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Solution of dy/dt = ${equation}`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItems) => {
              const dataIndex = tooltipItems[0]?.dataIndex
              if (dataIndex !== undefined) {
                const point = points[dataIndex]
                if (point) {
                  return `t = ${point.t.toFixed(6)}`
                }
              }
              return ''
            },
            label: (context) => {
              const point = points[context.dataIndex]
              if (point) {
                if (context.datasetIndex === 0) {
                  return `y = ${point.y.toFixed(6)}`
                } else {
                  return `dy/dt = ${point.dydt.toFixed(6)}`
                }
              }
              return ''
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 't',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'y',
            color: 'rgb(37, 99, 235)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(37, 99, 235, 0.1)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'dy/dt',
            color: 'rgb(239, 68, 68)',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            drawOnChartArea: false,
            color: 'rgba(239, 68, 68, 0.1)'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }

    // Create chart
    this.chart = new Chart(this.canvas, {
      type: 'line',
      data,
      options
    })
  }

  /**
   * Creates or updates the chart with coupled solution data
   * @param points - Array of coupled solution points
   * @param _equations - The system of equations being displayed
   * @param _method - The numerical method used
   */
  public displayCoupled(points: CoupledSolutionPoint[], _equations: string[], _method: string): void {
    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }

    if (points.length === 0) return

    // Generate colors for each variable
    const colors = [
      'rgb(37, 99, 235)',   // blue
      'rgb(239, 68, 68)',   // red  
      'rgb(34, 197, 94)',   // green
      'rgb(168, 85, 247)',  // purple
      'rgb(245, 158, 11)',  // amber
      'rgb(236, 72, 153)',  // pink
      'rgb(20, 184, 166)',  // teal
      'rgb(251, 113, 133)', // rose
    ]

    const firstPoint = points[0]
    if (!firstPoint) return

    const numVariables = firstPoint.y.length

    // Prepare datasets for each variable
    const datasets = []
    for (let i = 0; i < numVariables; i++) {
      datasets.push({
        label: `y${i + 1}(t)`,
        data: points.map(p => ({ x: p.t, y: p.y[i] ?? 0 })),
        borderColor: colors[i % colors.length],
        backgroundColor: `${colors[i % colors.length]}20`,
        borderWidth: 2,
        pointRadius: points.length > 100 ? 0 : 1,
        pointBackgroundColor: colors[i % colors.length],
        fill: false,
        tension: 0.1
      })
    }

    // Prepare data
    const data: ChartData<'line'> = {
      labels: points.map(p => p.t.toFixed(3)),
      datasets
    }

    // Chart options for coupled system
    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Coupled System Solution (${numVariables} variables)`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItems) => {
              const dataIndex = tooltipItems[0]?.dataIndex
              if (dataIndex !== undefined) {
                const point = points[dataIndex]
                if (point) {
                  return `t = ${point.t.toFixed(6)}`
                }
              }
              return ''
            },
            label: (context) => {
              const point = points[context.dataIndex]
              const variableIndex = context.datasetIndex
              if (point && variableIndex < point.y.length && point.y[variableIndex] !== undefined) {
                return `y${variableIndex + 1} = ${point.y[variableIndex].toFixed(6)}`
              }
              return ''
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          display: true,
          title: {
            display: true,
            text: 't',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Variables',
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }

    // Create chart
    this.chart = new Chart(this.canvas, {
      type: 'line',
      data,
      options
    })
  }

  /**
   * Clears the chart
   */
  public clear(): void {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }

  /**
   * Downloads the chart as an image
   * @param filename - Name for the downloaded file
   */
  public downloadAsImage(filename = 'ode-solution.png'): void {
    if (!this.chart) return

    const link = document.createElement('a')
    link.download = filename
    link.href = this.chart.toBase64Image('image/png', 1)
    link.click()
  }

  /**
   * Gets chart statistics
   * @returns Chart statistics
   */
  public getStats(): {
    minX: number
    maxX: number
    minY: number
    maxY: number
    pointCount: number
  } | null {
    if (!this.chart?.data.datasets[0]?.data || this.chart.data.datasets[0].data.length === 0) return null

    const data = this.chart.data.datasets[0].data as Array<{ x: number; y: number }>
    const xValues = data.map(d => d.x)
    const yValues = data.map(d => d.y)

    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
      pointCount: data.length
    }
  }

  /**
   * Updates chart theme
   * @param isDark - Whether to use dark theme
   */
  public updateTheme(isDark: boolean): void {
    if (!this.chart) return

    const textColor = isDark ? '#ffffff' : '#374151'

    // Update chart options
    if (this.chart.options.plugins?.title) {
      this.chart.options.plugins.title.color = textColor
    }
    
    if (this.chart.options.plugins?.legend?.labels) {
      this.chart.options.plugins.legend.labels.color = textColor
    }

    this.chart.update()
  }

  /**
   * Destroys the chart and cleans up resources
   */
  public destroy(): void {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
}
