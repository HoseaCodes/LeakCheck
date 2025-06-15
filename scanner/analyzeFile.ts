import * as vscode from 'vscode';

export interface LeakPattern {
  name: string;
  description: string;
  regex: RegExp;
  suggestion: string;
}

const leakPatterns: LeakPattern[] = [
  {
    name: 'Missing Cleanup in useEffect',
    description: 'useEffect is missing a cleanup function. This can cause memory leaks if listeners or timers are left active.',
    regex: /useEffect\s*\(\s*\(.*\)\s*=>\s*{[^}]*}\s*,\s*\[.*\]\s*\)/gs,
    suggestion: 'Add a return cleanup function inside useEffect to remove listeners, intervals, etc.'
  },
  {
    name: 'Uncleared setInterval',
    description: 'setInterval is used without being cleared. This causes intervals to stack over time.',
    regex: /setInterval\s*\(.*\)[^;]*;/g,
    suggestion: 'Store interval ID and call clearInterval in a cleanup function.'
  },
  {
    name: 'Uncleared setTimeout',
    description: 'setTimeout used without clearing or guarding for unmounted component.',
    regex: /setTimeout\s*\(.*\)[^;]*;/g,
    suggestion: 'Store timeout ID and clear it on unmount if needed.'
  },
  {
    name: 'Missing Firebase unsubscribe',
    description: 'Firebase onSnapshot or onAuthStateChanged used without unsubscribing.',
    regex: /on(Snapshot|AuthStateChanged)\s*\(.*=>.*\)/g,
    suggestion: 'Store the unsubscribe function and call it in your cleanup return.'
  },
  {
    name: 'DeviceEventEmitter leak',
    description: 'DeviceEventEmitter.addListener is used without being removed.',
    regex: /DeviceEventEmitter\.addListener\s*\(.*\)/g,
    suggestion: 'Store the subscription and call subscription.remove() on unmount.'
  }
];

export function analyzeTextForLeaks(text: string): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];

  leakPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const startPos = new vscode.Position(text.substr(0, start).split('\n').length - 1, 0);
      const endPos = new vscode.Position(text.substr(0, end).split('\n').length - 1, 999);

      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(startPos, endPos),
        `${pattern.name}: ${pattern.description}\nSuggestion: ${pattern.suggestion}`,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostics.push(diagnostic);
    }
  });

  return diagnostics;
}
