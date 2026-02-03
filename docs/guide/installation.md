# Installation

## Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Git** for version control

## Install Dependencies

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/odetest.git
cd odetest
npm install
```

## Development Setup

### 1. Install Development Tools

The project comes with all necessary development tools pre-configured:

- **TypeScript** - Type checking and compilation
- **Vite** - Fast development server and build tool
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

### 2. Verify Installation

Run the test suite to ensure everything is working:

```bash
npm test
```

### 3. Start Development

Start the development server:

```bash
npm run dev
```

## Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Available Scripts

| Script                  | Description                |
| ----------------------- | -------------------------- |
| `npm run dev`           | Start development server   |
| `npm run build`         | Build for production       |
| `npm test`              | Run unit tests             |
| `npm run test:coverage` | Run tests with coverage    |
| `npm run test:e2e`      | Run E2E tests              |
| `npm run lint`          | Check code with ESLint     |
| `npm run lint:fix`      | Fix ESLint issues          |
| `npm run format`        | Format code with Prettier  |
| `npm run docs:dev`      | Start documentation server |
| `npm run docs:build`    | Build documentation        |

## Editor Setup

### VS Code

Install recommended extensions:

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Playwright Test for VS Code

The project includes VS Code settings for optimal development experience.

### Other Editors

The project works with any editor that supports TypeScript and ESLint.
