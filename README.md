# MarkUp

A modern markdown editor and live preview application built with Tauri and React. Perfect for developers who love Vim and want real-time markdown visualization.

## Features

### 🔄 **Dual Mode Operation**
- **Editor Mode**: Built-in Monaco editor with live preview
- **File Watcher Mode**: Watch external files (perfect for Vim users)

### ✨ **Core Features**
- **Real-time preview** with markdown rendering
- **Mermaid diagram support** for flowcharts and diagrams
- **Split-screen layout** (responsive: stacks vertically on narrow screens)
- **State persistence** - remembers your last session
- **Dark theme** optimized for coding

### 🎯 **Perfect for Vim Users**
File Watcher Mode lets you:
- Edit in Vim (or any external editor)
- See live preview in MarkUp
- Auto-refreshes every 500ms when file changes
- No manual reload needed

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Rust](https://rustup.rs/)
- [Yarn](https://yarnpkg.com/)

### Installation & Development
```bash
# Clone and install dependencies
git clone <repository-url>
cd markup
yarn install

# Run in development mode
yarn tauri dev

# Build for production
yarn tauri build
```

## Usage

1. **Launch the app** - Choose your mode on the homepage
2. **Editor Mode** - Built-in editor with real-time preview
3. **File Watcher Mode** - Select a markdown file to watch
4. **Continue** - Automatically resume your last session

### File Watcher Workflow (Vim Users)
1. Select "File Watcher Mode"
2. Choose your markdown file
3. Edit in Vim - see changes instantly in MarkUp
4. Perfect for documentation, notes, and README files

## Supported Formats
- Markdown (`.md`, `.markdown`, `.mdown`, `.mkd`, `.mdx`)
- Mermaid diagrams in code blocks
- Standard markdown syntax

## Architecture
- **Frontend**: React 18 + Vite
- **Backend**: Rust + Tauri
- **Editor**: Monaco Editor
- **Rendering**: Marked.js + Mermaid.js
- **Persistence**: localStorage

## Development Commands
```bash
yarn dev          # Frontend development server
yarn build        # Build frontend
yarn tauri dev    # Run complete Tauri app
yarn tauri build  # Build production app
```

## Contributing
Built with modern web technologies and Rust for maximum performance and cross-platform compatibility.
