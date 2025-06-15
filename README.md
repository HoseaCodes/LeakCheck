# LeakCheck VS Code Extension
![logo](https://github.com/user-attachments/assets/d8e55918-2bc6-4146-9545-48ecd645fb0d)

**LeakCheck** is an open-source Visual Studio Code extension that helps you detect common memory leaks in React and React Native code — especially those related to `useEffect`, async callbacks, timers, and event listeners.

---

## 🚀 Features

- ✅ Detects missing cleanup in `useEffect`
- ✅ Warns about untracked `setTimeout` and `setInterval`
- ✅ Identifies unremoved Firebase and `DeviceEventEmitter` listeners
- ✅ Inline hover explanations with suggestions
- ✅ Optional **Quiz Mode** to test your knowledge and reinforce learning

---

## 📦 Installation

### From Source (Local Dev)
```bash
git clone https://github.com/HoseaCodes/leakcheck-vscode.git
cd leakcheck-vscode
npm install
code .
```

Then press `F5` to open a new Extension Development Host with LeakCheck enabled.

### From VS Code Marketplace (Coming Soon)
> Will be available on the Visual Studio Code Marketplace after publishing.

---

## 💡 Usage

LeakCheck will automatically scan your active `.js`, `.ts`, `.jsx`, or `.tsx` files. If it finds any potential memory leaks, it will:

- Highlight them with warnings
- Provide hover tooltips with explanations
- Suggest fixes

You can toggle **Quiz Mode** to practice identifying leak patterns yourself.

### Toggle Quiz Mode:
Press `Cmd+Shift+P` (or `Ctrl+Shift+P` on Windows/Linux) and select:
```
> LeakCheck: Toggle Quiz Mode
```

---

## 🧪 Patterns Detected

| Pattern | Risk |
|--------|------|
| `useEffect` without `return` cleanup | Memory leaks due to lingering listeners or timers |
| `setInterval` / `setTimeout` without clear | Timers persist across component unmounts |
| Firebase `onSnapshot` without unsubscribe | Persistent database subscriptions |
| `DeviceEventEmitter.addListener` without `.remove()` | Event stacking and memory consumption |
| Async `.then(setState)` without unmount guard | React warning and retained closures |

---

## 🧠 Architecture
LeakCheck uses a combination of:
- 🔍 Regex-based quick scans
- 🧠 AST (Abstract Syntax Tree) traversal with Babel for precise detection

---

## 🤝 Contributing

Pull requests, issue reports, and improvements are all welcome! To get started:

```bash
git clone https://github.com/HoseaCodes/leakcheck-vscode.git
cd leakcheck-vscode
npm install
```

Submit a PR with clear motivation and test cases included.

---

## 📜 License

This project is open-source and licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Dominique Hosea

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.
```

---

## ✨ Credits
Created by Dominique Hosea  
Built with ❤️ for developers who care about performance.

---

## 🔗 Links
- [React Docs: useEffect Cleanup](https://react.dev/reference/react/useEffect#examples-using-cleanup)
- [Firebase onSnapshot](https://firebase.google.com/docs/firestore/query-data/listen)
- [VS Code Extension API](https://code.visualstudio.com/api)

---

> LeakCheck helps you stop ghost code before it haunts your app.
