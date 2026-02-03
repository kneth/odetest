import { EquationParser } from './dist/ode-solver/index.js';

const parser = new EquationParser();

console.log('Testing sin(t) * y:');
const result1 = parser.parse('sin(t) * y');
console.log('Valid:', result1.valid);
console.log('Error:', result1.error);
console.log('Variables:', result1.variables);

console.log('\nTesting exp(t) - y:');
const result2 = parser.parse('exp(t) - y');
console.log('Valid:', result2.valid);
console.log('Error:', result2.error);
console.log('Variables:', result2.variables);

console.log('\nTesting t^2 + y^3:');
const result3 = parser.parse('t^2 + y^3');
console.log('Valid:', result3.valid);
console.log('Error:', result3.error);
console.log('Variables:', result3.variables);
