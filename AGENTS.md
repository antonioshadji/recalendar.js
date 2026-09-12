# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

**ReCalendar** (`recalendar.js`) is a web-based tool for generating personalized, interactive PDF calendars optimized for e-ink tablets (ReMarkable 1/2, Supernote, and custom devices). It allows users to configure various aspects of the calendar (layout, language, special dates, itinerary) and generates the linked PDF entirely client-side in the browser.

* **Core Purpose:** Client-side generation of linked PDF calendars.
* **Key Tech Stack:**
  * **Frontend Framework:** React (with Vite).
  * **Language:** JavaScript / TypeScript.
  * **PDF Generation:** `@react-pdf/renderer` for layout and `pdf-lib` for post-processing and assembly.
  * **Styling:** Bootstrap (via `react-bootstrap`), CSS modules, and custom CSS (`index.css`, `app.css`).
  * **Internationalization:** `i18next` and `react-i18next` (17+ languages).
  * **Date Handling:** `dayjs`.
* **Entry Point:** `create.html` -> `src/index.jsx` (with static pages like `index.html`, `faq.html`, `features.html`).

---

## Build & Development Commands

```bash
nvm use              # Use correct Node version (from .nvmrc)
npm install          # Install dependencies
npm run dev          # Start development server (Vite, usually at http://localhost:5173)
npm run build        # TypeScript check (tsc) + production build (vite build)
npm run lint         # ESLint with zero warnings tolerance
npm run format       # Prettier formatting across src/ and *.html
npm run preview      # Preview production build locally
npm run nginx        # Serve dist/ via nginx Docker container on port 8080
```

---

## Architecture & Key Directories

* `src/`: Main source code.
  * `config/`: App-wide configuration (`dayjs` setup, `i18n` initialization).
  * `configuration.jsx`: Top-level configuration container managing state, worker messaging, and PDF download.
  * `configuration-form/`: Form components for the configuration UI (`configuration-selector.jsx`, `itinerary.jsx`, `special-dates.jsx`, etc.).
  * `components/`: Reusable UI components (e.g. `pdf-progress.jsx`, `pdf-preview-card.jsx`).
  * `lib/`: Helper libraries and utilities (`date.js`, `device-utils.js`, `id-utils.js`, `config-compat.js`, etc.).
  * `locales/`: Translation JSON files organized by language code (e.g., `en`, `de`, `fr`, `es`).
  * `pdf/`: **Core PDF Generation Logic.**
    * `recalendar.jsx`: The root `Document` component (`RecalendarPdf`) orchestrating all calendar pages.
    * `pages/`: Individual page layouts (`day`, `week-overview`, `month-overview`, `year-overview`, `week-retrospective`, `last`).
    * `components/`: Shared PDF components (`header`, `mini-calendar`, `itinerary`).
    * `styles.js`: Stylesheet definitions for PDF elements via `@react-pdf/renderer`.
    * `config.js`: `PdfConfig` class defining options and defaults.
  * `worker/`: Web Worker (`pdf.worker.js`) for off-main-thread PDF generation to keep UI responsive.
* `public/`: Static assets (custom fonts, images, static HTML files).
* `dist/`: Build output directory.

---

## Core Data Flow & PDF Generation

### Data Flow

1. **Configuration Form** (`src/configuration.jsx` & `src/configuration-form/`): Manages all calendar settings via React form controls.
2. **PDF Worker** (`src/worker/pdf.worker.js`): Web Worker that generates PDFs off the main thread to prevent UI freezing.
3. **PDF Renderer** (`src/pdf/recalendar.jsx`): Builds the page tree by iterating through dates according to the configuration.

### Configuration System

* `PdfConfig` class (`src/pdf/config.js`) holds all calendar configuration with default values.
* Config is serialized and embedded directly inside the generated PDF as an attachment (`config.json`), allowing existing PDFs to be re-imported and re-edited.
* Supports versioned config formats (currently v3) for backwards compatibility.
* `hydrateFromObject()` extracts only whitelisted fields from incoming configuration objects.

### PDF Generation Pattern

* Pages receive a `config` prop (`PdfConfig` instance) and a `date` prop (`dayjs` instance).
* The Web Worker:
  1. Creates a `PdfConfig` instance from form state.
  2. Renders `<RecalendarPdf>`, assembling pages and component trees via `@react-pdf/renderer`.
  3. Uses `pdf-lib` for post-processing/assembly and embedding metadata/attachments.
  4. Converts the result to a Blob and posts it back to the main thread for preview/download.

---

## Internationalization & Device Support

### Internationalization (i18n)

* Uses `i18next` with namespace separation:
  * `app`: UI labels, forms, navigation.
  * `pdf`: PDF text, headers, and section names.
  * `config`: Default configuration values.
* `dayjs` locale is automatically synchronized with the active i18n language selection.
* First day of week is configurable and dynamically updates `dayjs` locale settings.

### Device Support

* `src/lib/device-utils.js` defines device presets (ReMarkable 1/2, Supernote, etc.) with their respective DPI and screen resolutions.
* A "Custom" device option allows manual specification of width, height, and DPI.

---

## Development Conventions

* **Styling:** Uses a mix of standard CSS (`index.css`, `app.css`, Bootstrap classes) for the web UI, and `@react-pdf/renderer`'s `StyleSheet.create()` for PDF components.
* **Components:** Functional components are preferred for UI; Class components are used in some PDF generation logic (e.g., `RecalendarPdf`) and root loaders.
* **Path Aliases:** The project uses `~` as an alias for the `src` directory (configured in `vite.config.ts` and `tsconfig.json`).
* **Fonts:** Custom fonts (Arimo, Lato, Montserrat, SourceSerifPro) are loaded and registered for embedding into the PDF.
* **Linting:** ESLint is configured with strict zero-warning tolerance (`--max-warnings 0`).

---

## Critical Files

* `vite.config.ts`: Vite configuration including the `create.html` entry point, i18n virtual loader, and path aliases.
* `src/configuration.jsx`: Main React configuration UI and worker coordinator.
* `src/configuration-form/configuration-selector.jsx`: Core form component where users select calendar features and options.
* `src/pdf/config.js`: `PdfConfig` definition, validation, and hydration logic.
* `src/pdf/recalendar.jsx`: Root PDF `Document` component.
* `src/worker/pdf.worker.js`: Web worker handling background PDF rendering.
* `src/lib/date.js`: Date manipulation and calculation utilities.
