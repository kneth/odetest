---
layout: home

hero:
  name: 'OdeTest'
  text: 'Modern TypeScript Calculator'
  tagline: 'A comprehensive mathematical calculator with modern TypeScript tooling'
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-username/odetest

features:
  - icon: ⚡️
    title: Lightning Fast
    details: Built with Vite for blazing fast development and optimized builds
  - icon: 🛡️
    title: Type Safe
    details: Comprehensive TypeScript support with strict type checking
  - icon: 🧪
    title: Well Tested
    details: Unit tests with Vitest and E2E tests with Playwright
  - icon: 📚
    title: Well Documented
    details: API documentation with TypeDoc and user guides with VitePress
  - icon: 🔧
    title: Developer Friendly
    details: Modern tooling with ESLint, Prettier, and Husky
  - icon: 🎯
    title: Production Ready
    details: Comprehensive CI/CD pipeline with GitHub Actions
---

## Quick Example

```typescript
import { Calculator } from 'odetest'

const calc = new Calculator({ precision: 3 })

console.log(calc.add(2.1, 3.7)) // 5.800
console.log(calc.multiply(4, 5)) // 20.000
console.log(calc.power(2, 10)) // 1024.000

// View calculation history
console.log(calc.getHistory())
```

## Why OdeTest?

OdeTest demonstrates modern TypeScript development practices with:

- **Modern ES2022+ TypeScript** with strict type checking
- **Vite** for lightning-fast builds and development
- **Vitest** for comprehensive unit testing
- **Playwright** for reliable E2E testing
- **ESLint & Prettier** for consistent code quality
- **TypeDoc** for automated API documentation
- **VitePress** for beautiful documentation sites
- **Husky & lint-staged** for pre-commit quality checks

Perfect for learning modern TypeScript development or as a foundation for your next project!
