# ReCalendar Codebase Context

## Project Overview

**ReCalendar** (`recalendar.js`) is a web-based tool for generating personalized, interactive PDF calendars optimized for ReMarkable tablets (and potentially others). It allows users to configure various aspects of the calendar (layout, language, special dates) and generates the PDF entirely in the browser.

*   **Core Purpose:** Client-side generation of linked PDF calendars.
*   **Key Tech Stack:**
    *   **Frontend Framework:** React (with Vite).
    *   **Language:** JavaScript / TypeScript.
    *   **PDF Generation:** `@react-pdf/renderer` for layout and `pdf-lib` for post-processing/assembly.
    *   **Styling:** Bootstrap (via `react-bootstrap`) and CSS modules.
    *   **Internationalization:** `i18next`.
    *   **Date Handling:** `dayjs`.
*   **Entry Point:** `create.html` -> `src/index.jsx`.

## Architecture & Key Directories

*   `src/`: Main source code.
    *   `config/`: App-wide configuration (dayjs setup, i18n).
    *   `configuration-form/`: React components for the user interface where users select calendar options (dates, layout, features).
    *   `lib/`: Helper libraries and utilities (date manipulation, PDF helpers, device utils).
    *   `locales/`: Translation files (JSON) for various languages.
    *   `pdf/`: **Core PDF Generation Logic.**
        *   `recalendar.jsx`: The main `Document` component that orchestrates the calendar pages.
        *   `pages/`: Individual page layouts (Day, Week Overview, Month Overview, Year Overview).
        *   `components/`: Reusable PDF components (headers, mini-calendars).
        *   `styles.js`: Stylesheet definitions for the PDF.
    *   `worker/`: Web Worker for off-main-thread PDF generation (likely to prevent UI freezing).
*   `public/`: Static assets (fonts, HTML files for static pages like FAQ).
*   `dist/`: Build output directory.

## Building & Running

**Development:**
```bash
npm run dev
# Starts Vite dev server (usually at http://localhost:5173)
```

**Production Build:**
```bash
npm run build
# Compiles TypeScript and builds assets using Vite
```

**Preview Production Build:**
```bash
npm run preview
```

## Development Conventions

*   **Styling:** Uses a mix of standard CSS (`index.css`) and `react-pdf`'s `StyleSheet` for PDF components.
*   **Components:** Functional components are preferred for UI; Class components are used in some PDF logic (e.g., `RecalendarPdf`).
*   **Path Aliases:** The project uses `~` as an alias for the `src` directory (configured in `vite.config.ts` and `tsconfig.json`).
*   **Internationalization:** All user-facing text should be internationalized using `i18next`. Translation keys are organized by namespaces (app, config, pdf).
*   **Fonts:** Custom fonts (Arimo, Lato, Montserrat, SourceSerifPro) are loaded for embedding into the PDF.

## Critical Files

*   `vite.config.ts`: Vite configuration, including the `create.html` entry point and i18n loader.
*   `src/pdf/recalendar.jsx`: The "root" component for the PDF document structure.
*   `src/configuration-form/configuration-selector.jsx`: Likely the main form for user input.
*   `src/lib/date.js`: Date manipulation utilities.
