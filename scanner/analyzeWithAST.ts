import * as vscode from 'vscode';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export function analyzeTextWithAST(text: string): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];

  let ast;
  try {
    ast = parser.parse(text, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (error) {
    console.error('AST parsing failed:', error);
    return diagnostics;
  }

  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;

      // Detect useEffect with no return (no cleanup)
      if (
        t.isIdentifier(callee, { name: 'useEffect' }) &&
        path.node.arguments.length >= 1 &&
        t.isArrowFunctionExpression(path.node.arguments[0])
      ) {
        const effectFn = path.node.arguments[0];
        let hasReturn = false;

        if (t.isBlockStatement(effectFn.body)) {
          effectFn.body.body.forEach(statement => {
            if (t.isReturnStatement(statement) && t.isArrowFunctionExpression(statement.argument)) {
              hasReturn = true;
            }
          });
        }

        if (!hasReturn) {
          const loc = path.node.loc;
          if (loc) {
            const startPos = new vscode.Position(loc.start.line - 1, loc.start.column);
            const endPos = new vscode.Position(loc.end.line - 1, loc.end.column);
            diagnostics.push(
              new vscode.Diagnostic(
                new vscode.Range(startPos, endPos),
                'useEffect is missing a cleanup function (no return). This may cause memory leaks.',
                vscode.DiagnosticSeverity.Warning
              )
            );
          }
        }
      }
    },
  });

  return diagnostics;
}
