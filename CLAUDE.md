# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri + React application that creates cross-platform desktop apps using web technologies. The project combines a React frontend with a Rust backend through Tauri's IPC system.

## Architecture

- **Frontend**: React 18 with Vite as the build tool
- **Backend**: Rust with Tauri framework
- **IPC**: Tauri commands for frontend-backend communication
- **Package Manager**: Yarn

### Key Components

- `src/`: React frontend source code
  - `main.jsx`: React app entry point
  - `App.jsx`: Main React component with Tauri command invocation example
- `src-tauri/`: Rust backend source code
  - `src/main.rs`: Tauri app entry point
  - `src/lib.rs`: Tauri commands and app configuration
  - `Cargo.toml`: Rust dependencies and build config
  - `tauri.conf.json`: Tauri app configuration

## Development Commands

### Frontend Development
```bash
yarn dev          # Start Vite dev server (port 1420)
yarn build        # Build frontend for production
yarn preview      # Preview production build
```

### Tauri Development
```bash
yarn tauri dev    # Start Tauri app in development mode
yarn tauri build  # Build Tauri app for production
```

### Full Development Workflow
- Use `yarn tauri dev` to run the complete application (frontend + backend)
- The frontend runs on port 1420 with HMR enabled
- Rust backend changes require app restart

## Tauri Commands

Commands are defined in `src-tauri/src/lib.rs` and called from React using `invoke()`:

- `greet(name: &str)`: Example command that returns a greeting string

To add new commands:
1. Define the command function in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Add it to the `invoke_handler` in the `run()` function
3. Call it from React using `invoke("command_name", { args })`

## Build Configuration

- Vite config optimized for Tauri development
- Development server runs on fixed port 1420
- Frontend builds to `dist/` directory
- Tauri looks for frontend assets in `../dist`