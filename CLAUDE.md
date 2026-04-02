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
2. A **manual settings panel** for branding, layout, typography, custom fields, signature
3. **Inline editing** directly on the invoice preview

## Stack

- **Next.js 16** (App Router) — read `node_modules/next/dist/docs/` before writing any Next.js code
- **React 19** with TypeScript
- **Tailwind CSS v4** (PostCSS plugin, not Vite plugin — no `tailwind.config.*` file)
- **shadcn/ui** components (to be installed)
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
  layout.tsx          # Root layout (Server Component)
  page.tsx            # Home / main invoice page (Server shell + client subtree)
  api/
    invoice/
      route.ts        # POST — OpenAI agent processes invoice prompts
components/
  invoice/
    InvoiceEditor.tsx # "use client" — rendered invoice with inline editing
    InvoiceForm.tsx   # "use client" — settings sidebar panel
    EditableField.tsx # "use client" — click-to-edit field on the invoice
  ui/                 # shadcn/ui components
lib/
  types.ts            # InvoiceData, InvoiceItem, InvoiceField, InvoiceLabels types
  agent.ts            # OpenAI Agents SDK agent definition and tools
```

The invoice editor is a fully interactive client subtree. The AI agent runs server-side via a Route Handler — the client streams requests to `/api/invoice` and receives partial invoice data updates.

## InvoiceData Type (from prototype — source of truth)

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
  customFields: InvoiceField[];
  items: InvoiceItem[];
  currency: string;        // symbol, e.g. "$"
  taxRate: number;
  discount: number;
  notes: string;
  terms: string;
  themeColor: string;      // hex
  template: "standard" | "modern" | "minimal" | "classic" | "elegant" | "bold"
           | "corporate" | "creative" | "startup" | "receipt" | "gradient" | "retro";
  fontFamily?: string;
  signature?: { type: "text" | "draw"; value: string };
  labels: InvoiceLabels;   // all visible label strings, fully customizable
};
```

## Templates (12 total, all must be implemented)

standard, modern, minimal, classic, elegant, bold, corporate, creative, startup, receipt, gradient, retro

Each template controls header layout, typography style, and decorative elements. The items table and totals section are shared across templates.

## Key Features to Implement (from prototype)

- **Inline editing**: clicking any field on the invoice enters edit mode (dashed border → active input). `EditableField` handles text, number, date, and multiline types.
- **Dual mode**: "Edit" mode (full-width, inline editable) vs "Preview" mode (816×1056px, zoomable).
- **PDF export**: capture the invoice at 816×1056px (1:1.294 ratio, US Letter) using `html-to-image`, then `jsPDF`.
- **Logo upload**: base64 data URL stored in `invoiceData.logoUrl`.
- **Signature**: text (rendered as italic serif) or drawn (canvas → base64 PNG via `signature_pad`).
- **Custom fields**: arbitrary key-value pairs shown in the invoice header area.
- **Label customization**: every visible label (Title, "Bill To", "Qty", etc.) is editable inline on the invoice.

## AI Agent Design

The OpenAI Agents SDK agent (not a simple API call) must have **tools** to manipulate invoice data:

- `update_invoice_fields` — update top-level fields (title, dates, parties, currency, etc.)
- `update_items` — replace or merge the items array
- `update_styling` — change template, themeColor, fontFamily, padding, spacing
- `add_custom_fields` — add/remove custom fields
- `apply_template_preset` — set template + themeColor + font as a named style

The agent returns structured diffs, not full invoice replacements, so partial updates are non-destructive.

## Tailwind v4 Notes

Tailwind v4 uses CSS-first configuration via `app/globals.css` (`@theme` block), not a JS config file. Use `@import "tailwindcss"` and configure custom tokens in `@theme { ... }`. The PostCSS plugin is `@tailwindcss/postcss`.