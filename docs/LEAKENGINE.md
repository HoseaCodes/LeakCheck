# React Memory Leak Pattern Engine

A VS Code extension utility that automatically detects common React and React Native memory leak patterns in your codebase and provides inline warnings with actionable suggestions.

## Overview

The leak pattern engine scans JavaScript/TypeScript files for problematic code patterns that commonly cause memory leaks in React applications. When detected, it displays VS Code diagnostics (yellow squiggly lines) with detailed explanations and fix suggestions.

## Features

✅ **Pattern-based Detection**: Uses regex patterns to identify leak-prone code  
✅ **VS Code Integration**: Shows diagnostics directly in the editor  
✅ **Actionable Suggestions**: Provides specific guidance on how to fix each issue  
✅ **Zero Configuration**: Works out of the box with common React patterns  
✅ **Performance Optimized**: Lightweight regex scanning

## Detected Patterns

### 1. Missing Cleanup in useEffect
```javascript
// ❌ Problematic - Missing cleanup
useEffect(() => {
  const subscription = eventSource.subscribe(handler);
}, []);

// ✅ Fixed - With cleanup function
useEffect(() => {
  const subscription = eventSource.subscribe(handler);
  return () => subscription.unsubscribe(); // Cleanup!
}, []);
```

**Detection**: `useEffect` calls without a return cleanup function  
**Risk**: Event listeners, subscriptions, or timers left running after unmount

### 2. Uncleared setInterval
```javascript
// ❌ Problematic - Interval never cleared
setInterval(() => {
  updateCounter();
}, 1000);

// ✅ Fixed - Store ID and clear on unmount
useEffect(() => {
  const intervalId = setInterval(() => {
    updateCounter();
  }, 1000);
  return () => clearInterval(intervalId);
}, []);
```

**Detection**: `setInterval` calls without corresponding `clearInterval`  
**Risk**: Intervals continue running and stack up over time

### 3. Uncleared setTimeout  
```javascript
// ❌ Problematic - Timeout not guarded
setTimeout(() => {
  setState(newValue);
}, 2000);

// ✅ Fixed - Clear on unmount
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setState(newValue);
  }, 2000);
  return () => clearTimeout(timeoutId);
}, []);
```

**Detection**: `setTimeout` calls without cleanup consideration  
**Risk**: State updates on unmounted components

### 4. Missing Firebase Unsubscribe
```javascript
// ❌ Problematic - No unsubscribe
onSnapshot(collection, (snapshot) => {
  setData(snapshot.docs);
});

// ✅ Fixed - Store unsubscribe function
useEffect(() => {
  const unsubscribe = onSnapshot(collection, (snapshot) => {
    setData(snapshot.docs);
  });
  return unsubscribe; // Auto-cleanup
}, []);
```

**Detection**: Firebase `onSnapshot` or `onAuthStateChanged` without unsubscribe  
**Risk**: Active Firebase listeners consuming memory and bandwidth

### 5. DeviceEventEmitter Leak (React Native)
```javascript
// ❌ Problematic - Listener not removed  
DeviceEventEmitter.addListener('customEvent', handler);

// ✅ Fixed - Remove listener on unmount
useEffect(() => {
  const subscription = DeviceEventEmitter.addListener('customEvent', handler);
  return () => subscription.remove();
}, []);
```

**Detection**: `DeviceEventEmitter.addListener` without removal  
**Risk**: Native event listeners accumulating in React Native apps

## API Reference

### `analyzeTextForLeaks(text: string): vscode.Diagnostic[]`

Analyzes the provided text content and returns an array of VS Code diagnostics for detected memory leak patterns.

**Parameters:**
- `text` (string): The file content to analyze

**Returns:**
- `vscode.Diagnostic[]`: Array of diagnostic objects with position, message, and severity

**Example Usage:**
```typescript
import { analyzeTextForLeaks } from './scanner/analyzeFile';

// In your VS Code extension
const fileContent = document.getText();
const leakDiagnostics = analyzeTextForLeaks(fileContent);

// Apply diagnostics to the document
diagnosticCollection.set(document.uri, leakDiagnostics);
```

### `LeakPattern` Interface

```typescript
interface LeakPattern {
  name: string;           // Human-readable pattern name
  description: string;    // Detailed explanation of the issue
  regex: RegExp;         // Pattern matching regex
  suggestion: string;    // How to fix the issue
}
```

## Integration Guide

### Basic VS Code Extension Integration

```typescript
// extension.ts
import * as vscode from 'vscode';
import { analyzeTextForLeaks } from './scanner/analyzeFile';

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('react-leaks');
  
  // Analyze on file save
  const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.languageId === 'javascript' || document.languageId === 'typescript') {
      const diagnostics = analyzeTextForLeaks(document.getText());
      diagnosticCollection.set(document.uri, diagnostics);
    }
  });
  
  // Analyze on file open
  const openDisposable = vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === 'javascript' || document.languageId === 'typescript') {
      const diagnostics = analyzeTextForLeaks(document.getText());
      diagnosticCollection.set(document.uri, diagnostics);
    }
  });
  
  context.subscriptions.push(saveDisposable, openDisposable, diagnosticCollection);
}
```

### Real-time Analysis (On Change)

```typescript
// For more responsive feedback
const changeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
  const document = event.document;
  if (document.languageId === 'javascript' || document.languageId === 'typescript') {
    // Debounce for performance
    clearTimeout(changeTimer);
    changeTimer = setTimeout(() => {
      const diagnostics = analyzeTextForLeaks(document.getText());
      diagnosticCollection.set(document.uri, diagnostics);
    }, 500);
  }
});
```

## Configuration

### Supported File Types
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- React Native files
- Any file containing React hooks

### Performance Considerations
- **File Size**: Optimized for files under 10MB
- **Regex Efficiency**: Uses non-backtracking patterns where possible
- **Debouncing**: Recommended for real-time analysis to avoid excessive processing

## Limitations & Future Improvements

### Current Limitations
- **Regex-based**: May have false positives/negatives compared to AST analysis
- **Context Unaware**: Cannot detect if cleanup already exists elsewhere
- **Pattern Specific**: Only detects predefined patterns

### Planned Enhancements
- **AST Integration**: More accurate detection using TypeScript compiler API
- **Context Analysis**: Understand cleanup function relationships  
- **Custom Patterns**: User-configurable leak patterns
- **Auto-fix**: Code actions to automatically add cleanup functions
- **Test Coverage**: Comprehensive test suite for pattern validation

## Testing

### Example Test Cases
```typescript
// Test cases for validation
const testCases = [
  {
    description: 'Detects useEffect without cleanup',
    code: `useEffect(() => { subscribe(); }, []);`,
    expectedLeaks: 1
  },
  {
    description: 'Ignores useEffect with cleanup',
    code: `useEffect(() => { 
      subscribe(); 
      return () => unsubscribe();
    }, []);`,
    expectedLeaks: 0
  }
];
```

## Contributing

To extend the pattern detection:

1. **Add Pattern**: Define new `LeakPattern` in the `leakPatterns` array
2. **Test Regex**: Validate pattern matching with various code samples  
3. **Documentation**: Update this guide with the new pattern
4. **Testing**: Add test cases for the new detection

### Pattern Template
```typescript
{
  name: 'Your Pattern Name',
  description: 'Clear explanation of why this causes leaks',
  regex: /your-regex-pattern/g,
  suggestion: 'Specific steps to fix the issue'
}
```

---

## Quick Start

1. **Install**: Add the `analyzeFile.ts` to your VS Code extension
2. **Import**: `import { analyzeTextForLeaks } from './scanner/analyzeFile'`
3. **Integrate**: Call on file save/open events
4. **Display**: Apply diagnostics to VS Code document

Start preventing memory leaks in your React codebase today! 🚀
