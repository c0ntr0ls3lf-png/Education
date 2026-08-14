// Test LaTeX rendering
const testCases = [
  { input: 'x - \\frac{1}{x} = 1', desc: 'Double backslash (JSON escaped)' },
  { input: 'x - \\\\frac{1}{x} = 1', desc: 'Quadruple backslash' },
  { input: 'x - \\frac{1}{x} = 3', desc: 'Example from prompt' },
];

console.log('Test Cases:');
testCases.forEach((tc, i) => {
  console.log(`\n${i + 1}. ${tc.desc}`);
  console.log(`   Input: ${tc.input}`);
  
  // Simulate JSON parse
  try {
    const jsonStr = JSON.stringify({ formula: tc.input });
    const parsed = JSON.parse(jsonStr);
    console.log(`   After JSON parse: ${parsed.formula}`);
    
    // Apply frontend fix
    const fixed = parsed.formula.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
    console.log(`   After frontend fix: ${fixed}`);
  } catch (e) {
    console.log(`   Error: ${e.message}`);
  }
});
