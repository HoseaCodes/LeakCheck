# 🔍 System Design: LeakCheck Inline (VS Code Plugin)

## 🎯 Goal

Create a developer tool that analyzes open React Native files in VS Code, finds common memory leak patterns, and provides inline annotations with explanations and fix suggestions.

## 💎 1. Core Features

| Feature | Description |
|---------|-------------|
| 🔍 Static Leak Scanner | Scans JS/TS files for memory leak patterns (e.g., `useEffect` without cleanup, untracked `addListener`, async state updates after unmount) |
| 💡 Inline Warnings | Highlights suspicious code with hoverable tooltips explaining the issue |
| 📝 Fix Suggestions | Offers example fixes and links to documentation |
| ⚡ Real-Time Updates | Reruns scanner when file changes or is saved |
| 📝 Quiz Mode (Optional) | Lets users "guess" if a line is leaky and confirms after (practice mode) |

## 📁 2. Project Structure

```
leakcheck-inline/
├── extension.ts              # VS Code activation + entry logic
├── scanner/
│   └── analyzeFile.ts        # Main leak detection logic
├── diagnostics/
│   ├── leakPatterns.ts       # List of leak regex/signatures
│   └── createDiagnostics.ts  # Converts matches to VSCode diagnostics
├── ui/
│   └── tooltipContent.ts     # Tooltips + suggestions
├── snippets/
│   └── fixExamples.json      # Example fix snippets to display
├── test/
│   └── leakPattern.test.ts   # Unit tests for leak detectors
├── package.json              # Extension config (name, activationEvents, etc.)
└── tsconfig.json
```

## ⚙️ 3. Architecture Flow

```
flowchart TD
    A[VS Code File Opened/Saved] --> B[Leak Scanner Triggered]
    B --> C[Parse Document Text]
    C --> D[Apply Leak Detection Rules]
    D --> E[Create Diagnostics]
    E --> F[Add Inline Warning/Underline]
    F --> G[User Hovers Tooltip]
    G --> H[Show Explanation + Fix Code Snippet]
```

## 🧠 4. Leak Detection Rules

| Pattern | Detection |
|---------|-----------|
| `useEffect` with no return cleanup | RegEx + AST (optionally use Babel or ts-morph) |
| `setInterval`/`setTimeout` without clear call | RegEx match for missing `clearInterval` |
| `onSnapshot`, `addListener` without unsubscribe | Match known SDK methods |
| Async `setState` without `isMounted` guard | Match `.then(setState)` patterns |

## 📝 5. Optional: Practice Mode

- Daily or random inline snippet gets marked
- User clicks "Leak" or "Safe"
- Immediate feedback + confidence rating stored in local storage or Firebase

## 🛠️ 6. Tech Stack

| Part | Tech |
|------|------|
| Editor Extension | VS Code API (TypeScript) |
| Parser | RegEx + ts-morph or Babel AST (if advanced) |
| UI | VS Code native UI (diagnostics, hovers, decorations) |
| Data | Local memory or optional Firebase for quiz/fix tracking |
| Build | vsce or esbuild for bundling |
