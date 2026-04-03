# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured yet.

## Project Purpose

AI-powered invoice generator. Users can create and edit invoices through:
1. A **chat interface** backed by an OpenAI Agents SDK agent (server-side, with tools)
2. A **manual settings panel** for branding, layout, typography, signature
3. **Inline editing** directly on the invoice preview

## Stack

- **Next.js 16** (App Router) — read `node_modules/next/dist/docs/` before writing any Next.js code
- **React 19** with TypeScript
- **Tailwind CSS v4** (PostCSS plugin, not Vite plugin — no `tailwind.config.*` file)
- **Coss UI** (`https://coss.com/ui`) — component library built on Base UI + Tailwind CSS. Components are copy-paste-and-own (not a package dependency); they live in `components/ui/`. Docs for LLMs: `https://coss.com/ui/llms.txt`
- **OpenAI Agents SDK** (`@openai/agents`) for the AI backend — use Server Components / Route Handlers for all agent calls, never the client

## App Router Patterns (Next.js 16)

- All pages and layouts are **Server Components by default**. Add `"use client"` only when needed (state, event handlers, browser APIs, custom hooks).
- Dynamic route `params` is a **Promise**: `params: Promise<{ id: string }>`, always `await` it.
- API endpoints live in `app/api/**/route.ts` and export named functions (`GET`, `POST`, etc.).
- Route Handlers are **not cached by default**. Use `export const dynamic = 'force-static'` to opt in for GET.
- For slow navigations, read `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` — `Suspense` alone is not enough; you must also export `unstable_instant` from the route.

## Architecture

```
app/
  layout.tsx            # Root layout (Server Component, loads fonts via @import)
  page.tsx              # Landing page (Navbar + HeroSection)
  editor/
    page.tsx            # Invoice editor page — dynamically imports InvoiceEditor (SSR disabled)
  api/
    invoice/
      route.ts          # POST — OpenAI Agents SDK agent processes invoice prompts
components/
  invoice/
    InvoiceEditor.tsx   # "use client" — top-level editor shell, manages invoice state
    InvoiceCanvas.tsx   # "use client" — renders the invoice; routes to template headers, shared items/totals/signature
    EditableField.tsx   # "use client" — click-to-edit field (text, number, date, multiline)
    EditorToolbar.tsx   # "use client" — top toolbar (mode toggle, PDF export, theme color, zoom)
    SettingsPanel.tsx   # "use client" — tabbed sidebar (Templates, Branding, Typography, Document, Financials)
    ChatPanel.tsx       # "use client" — AI chat interface, streams to /api/invoice
    SignaturePad.tsx    # "use client" — draw or type signature using signature_pad
  landing/
    Navbar.tsx          # Landing page navigation
    HeroSection.tsx     # Landing page hero
    LandingButton.tsx   # Reusable CTA button for landing page
  ui/                   # shadcn/ui + custom primitives (button, input, select, slider, tabs, accordion, collapsible, date-picker, toolbar, toggle-group, etc.)
lib/
  types.ts              # InvoiceData, InvoiceItem, InvoiceLabels, Template types
  invoice-defaults.ts   # DEFAULT_INVOICE, DEFAULT_LABELS, TEMPLATES array, FONT_OPTIONS, SAMPLE_INVOICE
  storage.ts            # localStorage helpers for persisting invoice state
  utils.ts              # cn() and other utilities
hooks/
  use-media-query.ts    # Responsive breakpoint hook
```

The invoice editor is a fully interactive client subtree (`InvoiceEditor` → `InvoiceCanvas` + `SettingsPanel` + `ChatPanel`). The AI agent runs server-side via a Route Handler — the client posts to `/api/invoice` and receives partial invoice data updates.

`SettingsPanel` is dynamically imported with `{ ssr: false }` in the editor page to avoid hydration issues.

## InvoiceData Type (source of truth in `lib/types.ts`)

```ts
type InvoiceData = {
  id: string;
  logoUrl?: string;
  logoSize?: number;       // px, default 64
  rowSpacing?: number;     // px, default 16
  padding?: number;        // px, default 40
  title: string;
  invoiceNumber: string;
  date: string;            // yyyy-MM-dd
  dueDate: string;
  fromDetails: string;     // multiline
  toDetails: string;       // multiline
  items: InvoiceItem[];
  currency: string;        // symbol, e.g. "$"
  taxRate: number;
  discount: number;
  notes: string;
  terms: string;
  themeColor: string;      // hex
  template: Template;
  fontFamily?: string;
  signature?: { type: "text" | "draw"; value: string };
  labels: InvoiceLabels;   // all visible label strings, fully customizable
};
```

Note: `customFields` has been removed from the project. Do not re-introduce it.

## Templates (12 total — all implemented)

`standard`, `modern`, `minimal`, `classic`, `elegant`, `bold`, `corporate`, `creative`, `startup`, `receipt`, `gradient`, `retro`

Each template renders its own header section (from/to/dates/logo layout) inside `InvoiceCanvas`. The items table, totals, notes/terms, and signature are **shared** across all templates and rendered after the template header.

The `TEMPLATES` array in `lib/invoice-defaults.ts` includes `id`, `label`, and `preview` (Tailwind classes used for the thumbnail in SettingsPanel).

## Implemented Features

- **Inline editing**: clicking any field on the invoice enters edit mode (dashed border → active input). `EditableField` handles `text`, `number`, `date`, and `multiline` types.
- **Dual mode**: "Edit" mode (full-width, inline editable) vs "Preview" mode (816×1056px, zoomable).
- **PDF export**: capture the invoice at 816×1056px using `html-to-image`, then `jsPDF`. Cross-origin stylesheets are temporarily disabled during capture to avoid `cssRules` errors.
- **Logo upload**: base64 data URL stored in `invoiceData.logoUrl`.
- **Signature**: text (rendered as italic serif) or drawn (canvas → base64 PNG via `signature_pad`).
- **Label customization**: every visible label ("Bill To", "Qty", etc.) is editable inline on the invoice.
- **AI chat**: natural language edits streamed through `/api/invoice` using OpenAI Agents SDK.
- **Local persistence**: invoice state is saved to localStorage via `lib/storage.ts`.

## AI Agent Design

The OpenAI Agents SDK agent (not a simple API call) must have **tools** to manipulate invoice data:

- `update_invoice_fields` — update top-level fields (title, dates, parties, currency, etc.)
- `update_items` — replace or merge the items array
- `update_styling` — change template, themeColor, fontFamily, padding, spacing
- `apply_template_preset` — set template + themeColor + font as a named style

The agent returns structured diffs, not full invoice replacements, so partial updates are non-destructive.

## Tailwind v4 Notes

Tailwind v4 uses CSS-first configuration via `app/globals.css` (`@theme` block), not a JS config file. Use `@import "tailwindcss"` and configure custom tokens in `@theme { ... }`. The PostCSS plugin is `@tailwindcss/postcss`.
