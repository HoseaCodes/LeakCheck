* ✅ **Regex**: Fast and lightweight for simple patterns
* 🧠 **AST (Abstract Syntax Tree)**: More accurate and powerful for complex or nested code

---

## 🧩 1. **Regex-Based Rules (Quick Scans)**

| Leak Type                   | Regex Pattern                                                           | Description                                    |                            |
| --------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- | -------------------------- |
| ❗ useEffect with no cleanup | `useEffect\\s*\\(\\s*\\(.*\\)\\s*=>\\s*{[^}]*}\\s*,\\s*\\[.*\\]\\s*\\)` | Catches `useEffect` with no `return`           |                            |
| ❗ setInterval without clear | `setInterval\\s*\\(.*\\)[^;]*;`                                         | Finds `setInterval` usages not tracked/cleared |                            |
| ❗ setTimeout without clear  | `setTimeout\\s*\\(.*\\)[^;]*;`                                          | Finds `setTimeout` usages                      |                            |
| ❗ Firebase listener         | \`on(Snapshot                                                           | AuthStateChanged)\s\*\\(.*=>.*\\)\`            | Detects Firebase listeners |
| ❗ Event emitter             | `DeviceEventEmitter\\.addListener\\s*\\(.*\\)`                          | Detects emitter usage without cleanup          |                            |
| ❗ Async setState            | `\\.then\\s*\\(\\s*(set[A-Z][a-zA-Z]+)\\s*\\)`                          | Finds `.then(setState)` patterns without guard |                            |

---

## 🔍 2. **AST-Based Rules (High Confidence)**

These rules require using tools like `@babel/parser` or `ts-morph` to walk the AST and detect patterns that regex can’t.

---

### ✅ Rule: `useEffect` missing cleanup

**Goal**: Detect `useEffect(() => { ... })` with no `return () => {}` inside

**AST Logic**:

* Find `CallExpression` where `callee.name === "useEffect"`
* Check first argument: is `ArrowFunctionExpression`?
* Inside body, does it contain a `ReturnStatement`?

---

### ✅ Rule: setInterval or setTimeout ID not stored or cleared

**AST Logic**:

* Look for `CallExpression` with `callee.name === 'setInterval'` or `'setTimeout'`
* Check if assigned to a variable (e.g., `const id = setInterval(...)`)
* Confirm there is a corresponding `clearInterval(id)` in a `ReturnStatement` of the same `useEffect`

---

### ✅ Rule: Firebase onSnapshot without unsubscribe

**AST Logic**:

* Look for `CallExpression` with `callee.property.name === "onSnapshot"`
* Check if return value is assigned to a variable
* Check if that variable is called in a `ReturnStatement` as a function (`unsubscribe()`)

---

### ✅ Rule: `DeviceEventEmitter.addListener` not removed

**AST Logic**:

* Detect `CallExpression` with `DeviceEventEmitter.addListener`
* Ensure result is stored as `const subscription = ...`
* Inside `useEffect`, look for `return () => subscription.remove()` statement

---

### ✅ Rule: Async function updating state without mount check

**AST Logic**:

* Look for `.then(setSomething)` patterns
* Walk up to enclosing `useEffect`
* Check if there’s a `let isMounted = true;` and conditional check `if (isMounted)`

---

## 🧠 Tools You Can Use for AST

| Tool                    | Use                                                         |
| ----------------------- | ----------------------------------------------------------- |
| `@babel/parser`         | Parse JS/TS code into AST                                   |
| `@babel/traverse`       | Walk the tree and apply detection logic                     |
| `ts-morph`              | Higher-level TypeScript project AST with file + type info   |
| `eslint` + custom rules | Build these as ESLint rules for integration and LSP support |
