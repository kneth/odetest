# ODE Solver

> A comprehensive TypeScript-based ODE (Ordinary Differential Equation) solver supporting both single equations and coupled systems with interactive web visualization.

[![CI/CD Pipeline](https://github.com/your-username/odetest/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/odetest/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/your-username/odetest/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/odetest)
[![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

### 🔬 **ODE Solving Capabilities**
- **Single ODEs** - Solve first-order differential equations dy/dx = f(x,y)
- **Coupled Systems** - Handle systems of coupled ODEs with multiple variables
- **Numerical Methods** - Euler, Heun's Method, and Runge-Kutta 4th Order
- **Mathematical Parsing** - Support for complex expressions with trigonometric, exponential, and polynomial functions

### 🌐 **Interactive Web Application**
- **Modern UI** - Responsive web interface with real-time validation
- **Visualization** - Interactive charts with Chart.js showing solution curves and derivatives
- **Data Export** - Download solutions as CSV data or PNG charts
- **Example Gallery** - Pre-configured examples for common ODE types

### 🛠️ **Developer Tools**
- **⚡️ Lightning Fast** - Built with Vite for blazing fast development and optimized builds
- **🛡️ Type Safe** - Comprehensive TypeScript support with strict type checking
- **🧪 Well Tested** - Unit tests with Vitest and E2E tests with Playwright
- **📚 Well Documented** - API documentation with TypeDoc and user guides
- **🔧 Modern Tooling** - ESLint, Prettier, and Husky for code quality

## 📦 Installation

```bash
npm install odetest
```

## 🏃‍♂️ Quick Start

### Single ODE Example

```typescript
import { ODESolver } from 'odetest'

const solver = new ODESolver()

// Solve dy/dx = x + y with initial condition y(0) = 1
const result = await solver.solve('x + y', {
  x0: 0,
  y0: 1,
  xEnd: 2,
  stepSize: 0.1,
  method: 'rk4'
})

if (result.success) {
  console.log(`Computed ${result.points.length} points`)
  console.log(`Final value: y(${result.points[result.points.length-1]?.x}) = ${result.points[result.points.length-1]?.y}`)
}
```

### Coupled ODE System Example

```typescript
import { CoupledODESolver } from 'odetest'

const coupledSolver = new CoupledODESolver()

// Solve harmonic oscillator: dy1/dx = y2, dy2/dx = -y1
const result = await coupledSolver.solve(['y2', '-y1'], {
  x0: 0,
  y0: [1, 0],  // Initial position and velocity
  xEnd: 2 * Math.PI,
  stepSize: 0.1,
  method: 'rk4'
})

if (result.success) {
  console.log('Harmonic oscillator solution computed!')
  const finalPoint = result.points[result.points.length-1]
  console.log(`Final state: position=${finalPoint?.y[0]}, velocity=${finalPoint?.y[1]}`)
}
```

### Predator-Prey Model Example

```typescript
// Lotka-Volterra predator-prey model
const ecosystem = await coupledSolver.solve([
  '0.1 * y1 * (1 - y2/50)',      // Prey dynamics
  '-0.05 * y2 * (1 - y1/25)'     // Predator dynamics
], {
  x0: 0,
  y0: [10, 5],  // Initial prey and predator populations
  xEnd: 50,
  stepSize: 0.1,
  method: 'rk4'
})
```

### Chaotic System Example (Lorenz)

```typescript
// Famous Lorenz system (exhibits chaos)
const lorenz = await coupledSolver.solve([
  '10 * (y2 - y1)',              // σ(y - x)
  'y1 * (28 - y3) - y2',         // x(ρ - z) - y  
  'y1 * y2 - (8/3) * y3'         // xy - βz
], {
  x0: 0,
  y0: [1, 1, 1],
  xEnd: 25,
  stepSize: 0.01,
  method: 'rk4'
})
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/odetest.git
cd odetest

# Install dependencies
npm install

# Start development
npm run dev
```

### Available Scripts

| Script                  | Description                            |
| ----------------------- | -------------------------------------- |
| `npm run dev`           | Start development server               |
| `npm run build`         | Build for production                   |
| `npm test`              | Run unit tests                         |
| `npm run test:coverage` | Run tests with coverage report         |
| `npm run test:e2e`      | Run end-to-end tests                   |
| `npm run lint`          | Lint code with ESLint                  |
| `npm run format`        | Format code with Prettier              |
| `npm run docs:dev`      | Start documentation development server |
| `npm run docs:build`    | Build documentation for production     |

## 🧪 Testing

The project includes comprehensive testing:

### Unit Tests (Vitest)

```bash
npm test                    # Run tests
npm run test:coverage      # Run with coverage
npm run test:ui           # Run with UI
```

### E2E Tests (Playwright)

```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui      # Run with UI
```

## 📖 Documentation

- **[User Guide](https://your-username.github.io/odetest/)** - Complete documentation with examples
- **[API Reference](https://your-username.github.io/odetest/api/)** - Generated TypeDoc documentation

### Local Documentation

```bash
npm run docs:dev          # Start documentation server
npm run docs:build        # Build documentation
```

## 🏗️ Project Structure

```
odetest/
├── src/                  # Source code
│   ├── components/       # Main calculator components
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Main entry point
├── tests/               # Test files
│   ├── unit/            # Unit tests
│   ├── e2e/             # End-to-end tests
│   └── fixtures/        # Test fixtures
├── docs/                # Documentation
│   ├── guide/           # User guides
│   ├── examples/        # Code examples
│   └── .vitepress/      # VitePress configuration
└── dist/                # Built files
```

## 🔧 Configuration

The project uses modern configuration files:

- **TypeScript**: `tsconfig.json` with strict settings
- **Vite**: `vite.config.ts` for building and development
- **Vitest**: `vitest.config.ts` for unit testing
- **Playwright**: `playwright.config.ts` for E2E testing
- **ESLint**: `eslint.config.js` with TypeScript rules
- **Prettier**: `.prettierrc.json` for code formatting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all checks pass in CI

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TypeScript](https://typescriptlang.org) - Type safety and developer experience
- [Vite](https://vitejs.dev) - Fast build tool and development server
- [Vitest](https://vitest.dev) - Fast unit testing framework
- [Playwright](https://playwright.dev) - Reliable E2E testing
- [VitePress](https://vitepress.dev) - Documentation framework
- [TypeDoc](https://typedoc.org) - API documentation generator

## 📊 Project Stats

- **TypeScript**: 100% type coverage
- **Tests**: Unit and E2E test coverage
- **Documentation**: Comprehensive guides and API docs
- **CI/CD**: Automated testing and deployment
- **Code Quality**: ESLint, Prettier, and pre-commit hooks
