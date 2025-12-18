# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
nvm use              # Use correct Node version (from .nvmrc)
npm install          # Install dependencies
npm run dev          # Start development server (Vite)
npm run build        # TypeScript check + production build
npm run lint         # ESLint with zero warnings tolerance
npm run preview      # Preview production build
npm run nginx        # Serve dist via nginx docker container on port 8080
```

## Architecture Overview

ReCalendar is a browser-based PDF calendar generator optimized for ReMarkable tablets. It uses React for the UI and `@react-pdf/renderer` for PDF generation.

### Core Data Flow

1. **Configuration Form** (`src/configuration.jsx`) - Main React component that manages all calendar settings via form controls
2. **PDF Worker** (`src/worker/pdf.worker.js`) - Web Worker that generates PDFs off the main thread to keep UI responsive
3. **PDF Renderer** (`src/pdf/recalendar.jsx`) - Orchestrates PDF page generation by iterating through dates

### Key Directories

- `src/pdf/pages/` - Individual page components (day, week-overview, month-overview, year-overview, week-retrospective, last)
- `src/pdf/components/` - Shared PDF components (header, mini-calendar, itinerary)
- `src/configuration-form/` - Form components for the configuration UI
- `src/lib/` - Utility modules (date handling, device configs, ID generation, itinerary parsing)
- `src/locales/` - i18n translation files (17 languages)

### Configuration System

- `PdfConfig` class (`src/pdf/config.js`) holds all calendar configuration with defaults
- Config is serialized and embedded in the generated PDF as an attachment (`config.json`)
- Supports versioned config format (currently v3) for backwards compatibility
- `hydrateFromObject()` extracts only whitelisted fields from config objects

### PDF Generation Pattern

Pages receive a `config` prop (PdfConfig instance) and a `date` prop (dayjs instance). The worker:
1. Creates a PdfConfig from form state
2. Renders `<RecalendarPdf>` which builds the page tree
3. Converts to blob and posts back to main thread

### Internationalization

- Uses i18next with namespace separation: `app` (UI), `pdf` (PDF content), `config` (default values)
- dayjs locale is synced with i18n language selection
- First day of week is configurable and affects dayjs locale settings

### Device Support

`src/lib/device-utils.js` defines device presets (ReMarkable 1/2, Supernote, etc.) with their DPI and resolution. Custom device option allows manual configuration.
