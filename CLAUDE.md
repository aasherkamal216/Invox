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
      route.ts          # POST — OpenAI Agents SDK agent with 5 tools. Streams SSE (text deltas + invoice patches). Stores history via Responses API.
components/
  invoice/
    InvoiceEditor.tsx   # "use client" — top-level editor shell. Manages invoice + chat state. Reads SSE stream, appends text deltas, applies patches. Stores previousResponseId for multi-turn.
    InvoiceCanvas.tsx   # "use client" — renders the invoice; routes to template headers, shared items/totals/signature
    EditableField.tsx   # "use client" — click-to-edit field (text, number, date, multiline)
    EditorToolbar.tsx   # "use client" — top toolbar (mode toggle, PDF export, theme color, zoom)
    SettingsPanel.tsx   # "use client" — tabbed sidebar (Templates, Branding, Typography, Document, Financials)
    ChatPanel.tsx       # "use client" — AI chat bubble UI. Shows text streaming in real-time with blinking cursor. Sends message + invoiceData to /api/invoice.
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
- **AI chat**: Full agentic backend powered by OpenAI Agents SDK. Multi-turn conversations with server-side history (Responses API). SSE streaming text + live invoice patches. The agent has 5 tools to read/write all invoice properties.
- **Local persistence**: invoice state is saved to localStorage via `lib/storage.ts`. Also preserved across AI edits via SSE patches.

## AI Agent Backend (`app/api/invoice/route.ts`)

### Overview

The backend is a Next.js Route Handler (`POST /api/invoice`) that runs an **OpenAI Agents SDK agent** with 5 tools. It:
- Accepts streaming requests with `{ message, previousResponseId?, invoiceData }`
- Uses the **Responses API** (via `previousResponseId`) to store multi-turn conversation history server-side
- Returns **Server-Sent Events (SSE)** with text deltas + invoice patches
- Model: **gpt-5.4-mini** (configurable, currently set for cost/speed balance)

### Request/Response Flow

**Client sends:**
```json
{
  "message": "make the invoice blue",
  "previousResponseId": "resp_abc123...",
  "invoiceData": { ...full InvoiceData... }
}
```

**Server responds with SSE stream:**
```
data: {"type":"text","delta":"I'll change"}
data: {"type":"text","delta":" the color to blue"}
data: {"type":"patch","data":{"themeColor":"#3B82F6"}}
data: {"type":"done","lastResponseId":"resp_def456..."}
```

The client:
1. Reads SSE events, appending text deltas to the chat bubble
2. Applies patch updates to `invoiceData` state immediately
3. Stores `lastResponseId` for the next request (maintains history without sending full message arrays)

### 5 Agent Tools

#### 1. `get_current_invoice` (read-only)
**Parameters:** `reason: string` (why you're reading)

Returns the full live `InvoiceData` at request time. Use before targeted edits to reference item IDs, current template, existing field values, etc.

**Example:** "increase all item rates by 10%" → read current items → modify rates → call `update_items` with new values.

#### 2. `update_invoice_fields` (scalar fields)
**Parameters (all nullable):** `title`, `invoiceNumber`, `date`, `dueDate`, `fromDetails`, `toDetails`, `currency`, `taxRate`, `discount`, `notes`, `terms`

Updates any combination of top-level fields. Pass `null` for unchanged fields.

**What it can do:** Update dates, amounts, parties, terms, notes in one call.
**What it cannot do:** Touch line items, styling, or labels.

#### 3. `update_items` (line items)
**Parameters:** 
- `mode: "replace" | "merge"`
- `items: [{ id?, description, quantity, rate }]`
- `removeIds: string[]`

Manage line items via two modes:
- **replace**: Swap the entire items array (ids are generated if null)
- **merge**: Add new items (null id), update existing (by id), or delete (via `removeIds`)

Amounts are always auto-computed as `quantity × rate`.

**What it can do:** Add, edit, remove items; bulk replace all items.
**What it cannot do:** Reorder items (merge appends new ones at the end); partially update a single item field without resending all fields.

#### 4. `update_styling` (visual properties)
**Parameters (all nullable):** `template`, `themeColor`, `fontFamily`, `padding`, `rowSpacing`, `logoSize`

Updates layout and visual properties. Templates are validated against the 12 known names.

**What it can do:** Switch templates, change colors (hex), fonts, spacing, padding.
**What it cannot do:** Upload logo image, modify signature, customize label strings.

#### 5. `generate_invoice` (full invoice from description)
**Parameters:** 
- `description: string` (required)
- All other fields (nullable): `title`, `invoiceNumber`, `date`, `dueDate`, `fromDetails`, `toDetails`, `currency`, `taxRate`, `discount`, `notes`, `terms`, `items`, `template`, `themeColor`, `fontFamily`

Builds a complete invoice from natural language. Intelligently infers missing fields (dates, items, parties, template, color).

**Best for:** "Create a web design invoice for $5,000 with 3 milestones" or "make a tax-free invoice for a local client"

**What it can do:** Infer full invoice context, create items with realistic rates/quantities, pick appropriate templates and colors.
**What it cannot do:** Upload logos, set signatures, customize label strings.

### Schema Design Notes

All tool parameters use **`.nullable()`** instead of `.optional()` to satisfy OpenAI's strict JSON schema requirement that every key in `properties` must appear in `required`. The agent passes `null` to signal "don't change this field," and `execute()` functions check `!== null`.

### System Prompt

The agent is instructed to:
- ALWAYS call a tool to make changes (never just describe them)
- Respond in 1–2 concise sentences after tool calls
- Never ask for "amount" fields (auto-computed)
- Use currency symbols, not codes
- Be proactive (e.g., "make it professional for a law firm" → pick template + color auto)
- Reference the 12 template descriptions and suggest fits based on user intent

### Global Limitations

The agent **cannot**:
- Upload/change the logo image (UI-only)
- Draw or set signatures (UI-only)
- Customize label strings like "Bill To" → "Invoice For" (no `update_labels` tool)
- Undo or rollback changes (patches applied immediately)
- Reorder items in merge mode (new items append at end)

## Environment Setup

Create a `.env.local` file in the root with:
```
OPENAI_API_KEY=sk-...
```

This is required for the `/api/invoice` agent to run. The key is used server-side only; never exposed to the client.

## Tailwind v4 Notes

Tailwind v4 uses CSS-first configuration via `app/globals.css` (`@theme` block), not a JS config file. Use `@import "tailwindcss"` and configure custom tokens in `@theme { ... }`. The PostCSS plugin is `@tailwindcss/postcss`.
