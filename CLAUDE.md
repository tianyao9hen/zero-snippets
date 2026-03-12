# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zero Snippets is an Electron-based desktop knowledge management tool for developers and knowledge workers. It combines code snippet management, Markdown note editing, and web bookmark organization with local-first data storage using SQLite.

## Development Commands

### Setup & Development
```bash
npm install                    # Install dependencies
npm run dev                    # Start development mode with hot reload
npm start                      # Preview built application
```

### Type Checking
```bash
npm run typecheck              # Check both main and renderer types
npm run typecheck:node         # Check main process types only
npm run typecheck:web          # Check renderer process types only
```

### Code Quality
```bash
npm run lint                   # Lint and auto-fix code
npm run format                 # Format code with Prettier
```

### Testing
```bash
npm test                       # Run tests once
npm run test:watch             # Run tests in watch mode
```

### Building
```bash
npm run build                  # Build for production (runs typecheck first)
npm run build:unpack           # Build without packaging
npm run build:win              # Build Windows installer
npm run build:mac              # Build macOS installer
npm run build:linux            # Build Linux installer
```

## Architecture

### Electron Process Model

**Main Process** (`src/main/`): Node.js environment handling system-level operations
- `index.ts` - Application entry point, manages single instance lock, initializes shortcuts and tray
- `components/window.ts` - Window management (snippets search, note input, content windows)
- `components/ipc.ts` - IPC handlers registration
- `components/db/` - SQLite database layer with better-sqlite3
- `components/shortcut.ts` - Global keyboard shortcuts (F1 for search, F2 for notes)
- `components/tray.ts` - System tray icon and menu
- `components/menu.ts` - Application menu
- `components/commandRunner.ts` - Execute Windows commands (Nacos, Redis, MongoDB, etc.)
- `components/ossService.ts` - Aliyun OSS image upload service

**Preload Process** (`src/preload/`): Bridge between main and renderer
- `index.ts` - Exposes safe APIs to renderer via contextBridge
- `composables/` - Organized API modules (db, window, menu, autoLaunch, ossService)

**Renderer Process** (`src/renderer/`): Vue 3 application
- `main.ts` - Vue app initialization with Pinia, Vue Router, and ContextMenu
- `route/index.ts` - Application routing (snippets search, content management, note input, command log)
- `store/` - Pinia stores for state management
- `components/` - Vue components organized by feature
- `hooks/` - Composables for business logic
- `composables/` - Utility functions

### Database Schema (SQLite)

**Core Tables:**
- `snippets_type` - Content types (知识库/category, 网站库/web, 电脑软件/software, 随手记/note)
- `snippets_category` - Categories within each type
- `snippets_content` - Article/snippet content with Markdown support
- `snippets_web_tree` - Hierarchical bookmark tree (folders and links)
- `snippets_notes` - Quick notes (work/life grouping)
- `snippets_setting` - Key-value configuration storage
- `snippets_command` - Windows command definitions with shortcuts

**Database Location:** User data directory (managed by Electron)

### Key Features Architecture

**Search System:**
- Global shortcut (F1) opens snippets search window
- Searches across articles, web bookmarks, and commands
- Type-based filtering and category navigation

**Note System:**
- Global shortcut (F2) opens quick note input
- Supports work/life grouping modes
- Markdown editing with Bytemd editor

**Web Bookmark Management:**
- Tree structure with folders and bookmarks
- Browser bookmark import (HTML format)
- Favicon fetching and caching
- Shortcut-based quick access (e.g., "gg" for Google)
- Parameterized URLs for search engines (e.g., `https://google.com/search?q={}`)

**Command Runner:**
- Execute Windows commands from the app
- Support for common services (Nacos, Redis, MongoDB, RocketMQ)
- Start/stop commands with graceful shutdown
- Unified execution for multiple commands

**Image Upload:**
- Bytemd plugin for image upload
- Aliyun OSS integration with configurable bucket and prefix
- Automatic image insertion into Markdown

## Important Patterns

### IPC Communication
All main-renderer communication uses typed IPC channels defined in `src/enum/ipcEnum.ts`. The preload script exposes these via `window.api.*` methods.

### Database Operations
Database queries use parameterized statements via better-sqlite3. All SQL is in `src/main/components/db/sql/` organized by table.

### Window Management
The app uses multiple windows (snippets, note-input, content) managed by `src/main/components/window.ts`. Windows are shown/hidden rather than created/destroyed for performance.

### Route Structure
Content management uses nested routes: `/content/:tid/category/:cid/catelog/:aid/article` where tid=type, cid=category, aid=article.

### Highlight.js Optimization
Custom highlight.js build at `src/renderer/src/lib/highlight-core.ts` includes only needed languages to reduce bundle size. Vite alias redirects `import('highlight.js')` to this file.

## Configuration Files

- `electron.vite.config.ts` - Vite configuration for main/preload/renderer processes
- `tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json` - TypeScript configurations
- `package.json` - Dependencies and scripts
- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc.yaml` - Prettier configuration
- `tailwind.config.js` - Tailwind CSS configuration (if exists)

## Native Dependencies

**better-sqlite3** requires native compilation. After installing dependencies, run:
```bash
npm run postinstall  # Runs electron-builder install-app-deps
```

If you encounter issues, rebuild with:
```bash
npx electron-rebuild
```

## Testing

Tests are located in `src/tests/` using Vitest with jsdom environment. Test files include:
- `autoLaunch.test.ts` - Auto-launch functionality
- `noteSql.test.ts` - Database operations for notes
- `components/NoteInput.test.ts` - Note input component
- `components/NoteList.test.ts` - Note list component

## Common Gotchas

1. **Database initialization**: Tables are auto-created on first run via `src/main/components/db/tables.ts`
2. **Global shortcuts**: May conflict with other apps; configurable in settings
3. **Single instance**: App enforces single instance lock; second launch focuses existing window
4. **Window behavior**: Closing windows hides them; app stays in tray
5. **Command execution**: Windows-specific; commands run in user's shell environment
6. **OSS configuration**: Image upload requires Aliyun OSS credentials in settings
