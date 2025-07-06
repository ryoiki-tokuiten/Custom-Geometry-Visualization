// Ensure Math.js is loaded from CDN
const math = (window as any).math;

export function evaluateFunction(funcStr: string, variables: Record<string, number>): number | null {
  if (!math) {
    console.error("Math.js not loaded.");
    return null;
  }

  let processedFuncStr = funcStr.trim(); // Trim whitespace

  // Attempt to auto-correct common "funcx" to "func(x)" if "func" is a known Math.js function
  // and "funcx" itself is not a defined variable in the scope.
  // This targets errors like "Undefined symbol sinx".
  // Regex breakdown:
  // ^           - Start of the string
  // ([a-z_][a-z0-9_]*) - Capture group 1: function name part. Starts with a letter or underscore,
  //                     followed by zero or more letters, numbers, or underscores.
  // x           - Matches the literal character 'x'
  // $           - End of the string
  // i           - Case-insensitive match
  const matchFuncX = processedFuncStr.match(/^([a-z_][a-z0-9_]*)x$/i); 
  if (matchFuncX) {
    const funcNamePart = matchFuncX[1]; // e.g., "sin" from "sinx"
    
    // Check if funcNamePart (e.g. "sin") is a recognized function in Math.js
    // and ensure the full "namex" string isn't an intended variable in the current scope.
    if (typeof math[funcNamePart] === 'function' && !variables.hasOwnProperty(processedFuncStr)) {
      const correctedFuncStr = `${funcNamePart}(x)`;
      console.warn(`Potentially malformed function string "${processedFuncStr}" was auto-corrected to "${correctedFuncStr}". Please use standard notation like "sin(x)" or "cos(x)".`);
      processedFuncStr = correctedFuncStr;
    }
  }

  try {
    const compiled = math.compile(processedFuncStr);
    const result = compiled.evaluate(variables);

    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    
    console.warn(`Function "${processedFuncStr}" evaluated to a non-finite or non-numeric value: ${result}. (Original input: "${funcStr}")`);
    return null;
  } catch (error: any) {
    // Log the error with both processed and original function strings for clarity
    console.error(`Error evaluating function "${processedFuncStr}" (original input: "${funcStr}"):`, error.message || String(error));
    return null;
  }
}