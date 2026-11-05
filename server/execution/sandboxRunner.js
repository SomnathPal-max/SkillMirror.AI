import vm from 'node:vm';

export async function runInSandbox({ code, sprint, customTests = [], includeHidden = true }) {
  const startTime = Date.now();
  const logs = [];
  const results = {
    passed: true,
    totalTests: 0,
    passedCount: 0,
    failedCount: 0,
    tests: [],
    customTests: [],
    stdout: '',
    stderr: '',
    durationMs: 0
  };

  // Strip ES export keywords and determine exported identifier
  const classMatch = code.match(/export\s+(?:default\s+)?class\s+([a-zA-Z0-9_$]+)/);
  const funcMatch = code.match(/export\s+(?:default\s+)?function\s+([a-zA-Z0-9_$]+)/);
  const constMatch = code.match(/export\s+const\s+([a-zA-Z0-9_$]+)/);

  const exportedName = (classMatch && classMatch[1]) || 
                       (funcMatch && funcMatch[1]) || 
                       (constMatch && constMatch[1]) || null;

  let sanitizedCode = code
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+/g, '');

  if (exportedName) {
    sanitizedCode += `\nmodule.exports = ${exportedName};\nmodule.exports.${exportedName} = ${exportedName};`;
  }

  // Create isolated context
  const customConsole = {
    log: (...args) => logs.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
    warn: (...args) => logs.push({ type: 'warn', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
    error: (...args) => logs.push({ type: 'error', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
    info: (...args) => logs.push({ type: 'info', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') })
  };

  const sandboxContext = {
    console: customConsole,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Promise,
    Date,
    Math,
    JSON,
    Error,
    Array,
    Object,
    Number,
    String,
    Boolean,
    RegExp,
    Map,
    Set,
    module: { exports: {} },
    exports: {}
  };

  const vmContext = vm.createContext(sandboxContext);

  let exportedTarget = null;
  try {
    const wrappedScript = `
      (function(module, exports) {
        ${sanitizedCode}
      })(module, exports);
    `;
    const script = new vm.Script(wrappedScript, { filename: 'solution.js' });
    script.runInContext(vmContext, { timeout: 2000 });
    exportedTarget = sandboxContext.module.exports;
  } catch (err) {
    results.passed = false;
    results.stderr = `Syntax / Compilation Error: ${err.message}`;
    results.durationMs = Date.now() - startTime;
    return results;
  }

  // Helper to run a test function safely with async timeout protection
  async function executeTestFn(testObj, isHidden = false) {
    const testStart = Date.now();
    try {
      // Evaluate test code string
      const testScript = new vm.Script(`
        (async function() {
          const runTest = ${testObj.code};
          return await runTest(exportedTarget);
        })()
      `, { filename: `test-${testObj.id}.js` });

      sandboxContext.exportedTarget = exportedTarget;
      const testPromise = testScript.runInContext(vmContext);

      // Async deadlock timeout guard
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test execution timed out after 2000ms (deadlock or stalled promise loop)')), 2000);
      });

      await Promise.race([testPromise, timeoutPromise]);

      return {
        id: testObj.id,
        name: testObj.name,
        isHidden,
        passed: true,
        durationMs: Date.now() - testStart,
        error: null
      };
    } catch (testErr) {
      return {
        id: testObj.id,
        name: testObj.name,
        isHidden,
        passed: false,
        durationMs: Date.now() - testStart,
        error: testErr.message || String(testErr)
      };
    }
  }

  // 1. Run Public Tests
  for (const pubTest of (sprint.publicTests || [])) {
    const testResult = await executeTestFn(pubTest, false);
    results.tests.push(testResult);
    if (!testResult.passed) results.passed = false;
  }

  // 2. Run Hidden Tests if requested
  if (includeHidden) {
    for (const hidTest of (sprint.hiddenTests || [])) {
      const testResult = await executeTestFn(hidTest, true);
      results.tests.push(testResult);
      if (!testResult.passed) results.passed = false;
    }
  }

  // 3. Run Custom Tests (user defined edge cases)
  if (Array.isArray(customTests) && customTests.length > 0) {
    for (let i = 0; i < customTests.length; i++) {
      const ct = customTests[i];
      if (!ct.code || !ct.code.trim()) continue;
      const testResult = await executeTestFn({
        id: `custom-${i + 1}`,
        name: ct.name || `User Custom Test #${i + 1}`,
        code: ct.code
      }, false);
      results.customTests.push(testResult);
    }
  }

  results.totalTests = results.tests.length;
  results.passedCount = results.tests.filter(t => t.passed).length;
  results.failedCount = results.totalTests - results.passedCount;
  results.stdout = logs.map(l => `[${l.type.toUpperCase()}] ${l.text}`).join('\n');
  results.durationMs = Date.now() - startTime;

  return results;
}
