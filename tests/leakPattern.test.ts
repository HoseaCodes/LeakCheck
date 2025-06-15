import { analyzeTextWithAST } from '../scanner/analyzeWithAST';
import * as vscode from 'vscode';

describe('AST Memory Leak Detection', () => {
  function getDiagnosticMessages(text: string): string[] {
    const diagnostics = analyzeTextWithAST(text);
    return diagnostics.map(d => d.message);
  }

  test('Detects missing cleanup in useEffect', () => {
    const code = `
      import React, { useEffect } from 'react';
      
      const MyComponent = () => {
        useEffect(() => {
          const interval = setInterval(() => console.log("tick"), 1000);
        }, []);

        return <Text>Hello</Text>;
      };
    `;

    const messages = getDiagnosticMessages(code);
    expect(messages).toContain(
      'useEffect is missing a cleanup function (no return). This may cause memory leaks.'
    );
  });

  test('Does not flag useEffect with cleanup', () => {
    const code = `
      import React, { useEffect } from 'react';
      
      const MyComponent = () => {
        useEffect(() => {
          const interval = setInterval(() => console.log("tick"), 1000);
          return () => clearInterval(interval);
        }, []);

        return <Text>Hello</Text>;
      };
    `;

    const messages = getDiagnosticMessages(code);
    expect(messages).not.toContain(
      'useEffect is missing a cleanup function (no return). This may cause memory leaks.'
    );
  });

  test('Handles code with no useEffect gracefully', () => {
    const code = `
      const add = (a: number, b: number) => a + b;
      console.log(add(2, 3));
    `;

    const messages = getDiagnosticMessages(code);
    expect(messages.length).toBe(0);
  });
});
