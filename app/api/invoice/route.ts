export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { Agent, tool, run, user } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import type { InvoiceData, InvoiceItem, Template } from "@/lib/types";
import type { RunContext } from "@openai/agents";

// ---------------------------------------------------------------------------
// Context type passed through every tool call
// ---------------------------------------------------------------------------
type InvoiceContext = {
  invoiceData: InvoiceData;
  patch: Partial<InvoiceData>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function uuid(): string {
  return crypto.randomUUID();
}

function sse(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

function getCtx(runCtx: RunContext<unknown> | undefined): InvoiceContext {
  return (runCtx as RunContext<InvoiceContext>).context;
}

// ---------------------------------------------------------------------------
// Tool 1 — update_invoice_fields
// OpenAI strict mode requires ALL properties to be in `required`, so we use
// .nullable() instead of .optional() and check for null in execute().
// ---------------------------------------------------------------------------
const updateInvoiceFields = tool({
  name: "update_invoice_fields",
  description:
    "Update any top-level scalar fields of the invoice: title, invoiceNumber, date, dueDate, fromDetails, toDetails, currency (symbol), taxRate (%), discount (absolute amount), notes, terms. Pass null for any field you do not want to change.",
  parameters: z.object({
    title: z.string().nullable().describe("Invoice title, or null to leave unchanged"),
    invoiceNumber: z.string().nullable().describe("Invoice number, or null to leave unchanged"),
    date: z.string().nullable().describe("Issue date in yyyy-MM-dd format, or null to leave unchanged"),
    dueDate: z.string().nullable().describe("Due date in yyyy-MM-dd format, empty string \"\" to remove the due date, or null to leave unchanged"),
    fromDetails: z.string().nullable().describe("Multiline sender address / company details, or null to leave unchanged"),
    toDetails: z.string().nullable().describe("Multiline recipient / client details, or null to leave unchanged"),
    currency: z.string().nullable().describe("Currency symbol e.g. '$', '€', '£', or null to leave unchanged"),
    taxRate: z.number().nullable().describe("Tax rate as a percentage e.g. 10 for 10%, or null to leave unchanged"),
    discount: z.number().nullable().describe("Discount as an absolute amount e.g. 50, or null to leave unchanged"),
    notes: z.string().nullable().describe("Notes text, or null to leave unchanged"),
    terms: z.string().nullable().describe("Terms & conditions text, or null to leave unchanged"),
  }),
  execute(input, runCtx) {
    const ctx = getCtx(runCtx);
    const fields: Partial<InvoiceData> = {};
    if (input.title !== null) fields.title = input.title;
    if (input.invoiceNumber !== null) fields.invoiceNumber = input.invoiceNumber;
    if (input.date !== null) fields.date = input.date;
    if (input.dueDate !== null) fields.dueDate = input.dueDate || null;
    if (input.fromDetails !== null) fields.fromDetails = input.fromDetails;
    if (input.toDetails !== null) fields.toDetails = input.toDetails;
    if (input.currency !== null) fields.currency = input.currency;
    if (input.taxRate !== null) fields.taxRate = input.taxRate;
    if (input.discount !== null) fields.discount = input.discount;
    if (input.notes !== null) fields.notes = input.notes;
    if (input.terms !== null) fields.terms = input.terms;

    Object.assign(ctx.patch, fields);
    return JSON.stringify({ success: true, updatedFields: Object.keys(fields) });
  },
});

// ---------------------------------------------------------------------------
// Tool 2 — get_current_invoice
// ---------------------------------------------------------------------------
const getCurrentInvoice = tool({
  name: "get_current_invoice",
  description:
    "Read the current invoice data. Call this before making changes when you need to inspect existing values — e.g. to reference current item ids for a merge, check the current template, or read existing field values before modifying them.",
  parameters: z.object({}),
  execute(_input, runCtx) {
    const ctx = getCtx(runCtx);
    // Strip logoUrl (base64 data URL can be hundreds of KB — the model only needs to control logoSize)
    const { logoUrl: _logoUrl, ...safeData } = ctx.invoiceData;
    return JSON.stringify(safeData);
  },
});

// ---------------------------------------------------------------------------
// Tool 3 — update_items
// ---------------------------------------------------------------------------
const itemSchema = z.object({
  id: z.string().nullable().describe("Existing item id for merge mode, or null to create a new item"),
  description: z.string(),
  quantity: z.number(),
  rate: z.number().describe("Unit price — amount is calculated automatically as quantity * rate"),
});

const updateItems = tool({
  name: "update_items",
  description:
    "Update the invoice line items. Use mode='replace' to set the entire items array, or mode='merge' to add/update individual items (matched by id). Do NOT provide an amount field — it is always quantity * rate. To delete items in merge mode, pass their ids in removeIds (or empty array if none to remove).",
  parameters: z.object({
    mode: z.enum(["replace", "merge"]),
    items: z.array(itemSchema),
    removeIds: z.array(z.string()).describe("Ids to remove in merge mode. Pass an empty array if not removing any items."),
  }),
  execute(input, runCtx) {
    const ctx = getCtx(runCtx);
    const existing: InvoiceItem[] = ctx.invoiceData.items ?? [];

    let newItems: InvoiceItem[];

    if (input.mode === "replace") {
      newItems = input.items.map((it) => ({
        id: it.id ?? uuid(),
        description: it.description,
        quantity: it.quantity,
        rate: it.rate,
        amount: it.quantity * it.rate,
      }));
    } else {
      // merge — preserve existing order, then append new
      const map = new Map<string, InvoiceItem>(existing.map((i) => [i.id, i]));

      for (const rid of input.removeIds) map.delete(rid);

      for (const it of input.items) {
        const id = it.id && map.has(it.id) ? it.id : uuid();
        map.set(id, {
          id,
          description: it.description,
          quantity: it.quantity,
          rate: it.rate,
          amount: it.quantity * it.rate,
        });
      }

      newItems = Array.from(map.values());
    }

    ctx.patch.items = newItems;
    return JSON.stringify({ success: true, itemCount: newItems.length, items: newItems });
  },
});

// ---------------------------------------------------------------------------
// Tool 3 — update_styling
// ---------------------------------------------------------------------------
const VALID_TEMPLATES: Template[] = [
  "standard", "modern", "minimal", "classic", "elegant", "bold",
  "corporate", "creative", "startup", "receipt", "gradient", "retro",
];

const updateStyling = tool({
  name: "update_styling",
  description:
    "Change visual / layout properties of the invoice: template, themeColor (hex), fontFamily, padding (px), rowSpacing (px), logoSize (px), showWatermark (bool). Pass null for any field you do not want to change.",
  parameters: z.object({
    template: z.string().nullable().describe(`One of: ${VALID_TEMPLATES.join(", ")}. Or null to leave unchanged.`),
    themeColor: z.string().nullable().describe("Hex color e.g. '#3B82F6', or null to leave unchanged"),
    fontFamily: z.string().nullable().describe("Font family name available in the app, or null to leave unchanged"),
    padding: z.number().nullable().describe("Invoice padding in px, or null to leave unchanged"),
    rowSpacing: z.number().nullable().describe("Row spacing in px, or null to leave unchanged"),
    logoSize: z.number().nullable().describe("Logo size in px, or null to leave unchanged"),
    showWatermark: z.boolean().nullable().describe("true to show 'Powered by Invox' watermark at the bottom, false to hide it, or null to leave unchanged"),
  }),
  execute(input, runCtx) {
    const ctx = getCtx(runCtx);
    const fields: Partial<InvoiceData> = {};

    if (input.template !== null) {
      if (VALID_TEMPLATES.includes(input.template as Template)) {
        fields.template = input.template as Template;
      } else {
        return JSON.stringify({
          success: false,
          error: `Unknown template '${input.template}'. Valid options: ${VALID_TEMPLATES.join(", ")}`,
        });
      }
    }
    if (input.themeColor !== null) fields.themeColor = input.themeColor;
    if (input.fontFamily !== null) fields.fontFamily = input.fontFamily;
    if (input.padding !== null) fields.padding = input.padding;
    if (input.rowSpacing !== null) fields.rowSpacing = input.rowSpacing;
    if (input.logoSize !== null) fields.logoSize = input.logoSize;
    if (input.showWatermark !== null) fields.showWatermark = input.showWatermark;

    Object.assign(ctx.patch, fields);
    return JSON.stringify({ success: true, updatedFields: Object.keys(fields) });
  },
});

// ---------------------------------------------------------------------------
// Tool 4 — generate_invoice
// ---------------------------------------------------------------------------
const generateInvoice = tool({
  name: "generate_invoice",
  description:
    "Build a complete invoice from scratch based on a natural language description. Use this when the user asks to 'create', 'generate', or 'make' an invoice. Infer all fields intelligently — make good assumptions for anything not specified. Pass null for optional fields you want to auto-infer.",
  parameters: z.object({
    description: z.string().describe("Natural language description of what the invoice is for"),
    title: z.string().nullable().describe("Invoice title, or null to infer from description"),
    invoiceNumber: z.string().nullable().describe("Invoice number, or null to auto-generate"),
    date: z.string().nullable().describe("Issue date yyyy-MM-dd, or null for today"),
    dueDate: z.string().nullable().describe("Due date yyyy-MM-dd, or null for 30 days from today"),
    fromDetails: z.string().nullable().describe("Sender details, or null if not mentioned"),
    toDetails: z.string().nullable().describe("Recipient details, or null if not mentioned"),
    currency: z.string().nullable().describe("Currency symbol e.g. '$', or null to default to '$'"),
    taxRate: z.number().nullable().describe("Tax rate %, or null for 0"),
    discount: z.number().nullable().describe("Discount amount, or null for 0"),
    notes: z.string().nullable().describe("Notes text, or null for empty"),
    terms: z.string().nullable().describe("Terms text, or null for empty"),
    items: z.array(itemSchema).describe("Line items — always provide at least one based on the description"),
    template: z.string().nullable().describe(`One of: ${VALID_TEMPLATES.join(", ")}. Or null to auto-pick.`),
    themeColor: z.string().nullable().describe("Hex color, or null to auto-pick"),
    fontFamily: z.string().nullable().describe("Font family, or null to leave as default"),
  }),
  execute(input, runCtx) {
    const ctx = getCtx(runCtx);
    const today = new Date().toISOString().split("T")[0];
    const dueDate = input.dueDate ?? (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split("T")[0];
    })();

    const items: InvoiceItem[] = input.items.map((it) => ({
      id: it.id ?? uuid(),
      description: it.description,
      quantity: it.quantity,
      rate: it.rate,
      amount: it.quantity * it.rate,
    }));

    const template = input.template && VALID_TEMPLATES.includes(input.template as Template)
      ? (input.template as Template)
      : "standard";

    const patch: Partial<InvoiceData> = {
      title: input.title ?? "Invoice",
      invoiceNumber: input.invoiceNumber ?? `INV-${Date.now().toString().slice(-6)}`,
      date: input.date ?? today,
      dueDate,
      fromDetails: input.fromDetails ?? "",
      toDetails: input.toDetails ?? "",
      currency: input.currency ?? "$",
      taxRate: input.taxRate ?? 0,
      discount: input.discount ?? 0,
      notes: input.notes ?? "",
      terms: input.terms ?? "",
      items,
      template,
      themeColor: input.themeColor ?? "#3B82F6",
      ...(input.fontFamily ? { fontFamily: input.fontFamily } : {}),
    };

    Object.assign(ctx.patch, patch);
    return JSON.stringify({ success: true, patch });
  },
});

// ---------------------------------------------------------------------------
// Agent (module-scope — created once, not per request)
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are an expert invoice assistant integrated into an AI-powered invoice generator called "Invox". Your job is to help users create and edit professional invoices.

## Core Rules
- ALWAYS call a tool to make any change. Never just describe a change in text — execute it.
- After calling tools, respond with 1–2 concise, friendly sentences confirming what you did.
- Never ask for the "amount" of a line item — it is always calculated automatically as quantity × rate.
- Currency is always a symbol (e.g. "$", "€", "£", "¥"), never a 3-letter code like "USD".
- Dates must be in yyyy-MM-dd format.
- Today's date is ${new Date().toISOString().split("T")[0]}.

## Available Templates (12 total)
- **standard** — Clean, classic business layout with a simple header and line items table.
- **modern** — Contemporary design with bold accent bar and two-column header.
- **minimal** — Stripped-back, whitespace-focused layout for a refined look.
- **classic** — Traditional formal invoice style reminiscent of printed documents.
- **elegant** — Sophisticated serif-leaning design with refined spacing.
- **bold** — High-contrast layout with a strong colored header band.
- **corporate** — Professional enterprise look with structured grid and logo area.
- **creative** — Expressive design with asymmetric layout, great for agencies/freelancers.
- **startup** — Modern tech-company aesthetic with clean typography and subtle accents.
- **receipt** — Compact single-column format, ideal for small transactions or point-of-sale.
- **gradient** — Eye-catching design with a gradient color header for a modern premium feel.
- **retro** — Nostalgic vintage aesthetic with decorative borders and retro typography.

## Tool Usage Guide
- **update_invoice_fields** — Use for any top-level scalar field changes (title, dates, parties, currency, tax, discount, notes, terms). Pass null for fields you are not changing.
- **update_items** — Use to add, edit, or remove line items. Use mode="replace" for full replacement, mode="merge" for targeted changes.
- **update_styling** — Use to change the template, color theme, font, padding, or spacing. Pass null for fields you are not changing.
- **generate_invoice** — Use when the user wants to create a complete invoice from scratch. Infer all fields intelligently from their description.

## Behavior Guidelines
- Be proactive: if a user says "make it look professional for a law firm", pick an appropriate template (e.g. "classic" or "corporate") and a neutral color automatically.
- If the user says "add an item for X at $Y", infer quantity=1, rate=Y, description=X.
- If the user asks to change the currency to euros, set currency="€".
- For "net 30" terms, set dueDate to 30 days from the invoice date and terms="Net 30".
- Keep text responses brief and action-oriented.

## Attached Files
If the user attaches an image (PNG/JPG), carefully examine it. It may be a photo of an existing invoice, a logo, a receipt, or a reference design. Extract any relevant information (company names, line items, amounts, dates, styling) and use it to populate or update the invoice accordingly. Always call a tool to apply what you extract — never just describe it.
If the user attaches a PDF, treat it the same way: read its content, extract invoice-relevant data (parties, items, totals, terms), and apply it using the appropriate tools.
If no explicit instruction accompanies the attachment, assume the user wants you to recreate or populate the invoice from the file's content.`;

const AGENT_TOOLS = [getCurrentInvoice, updateInvoiceFields, updateItems, updateStyling, generateInvoice];

function createAgent(model: string) {
  return new Agent({
    name: "Invoice Editor",
    instructions: SYSTEM_PROMPT,
    model,
    tools: AGENT_TOOLS,
  });
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  type AttachedFile = { name: string; mimeType: string; base64: string };

  // ── 1. Auth check (only when NEXT_PUBLIC_ENABLE_AUTH=true) ──────────────
  let authUserId: string | null = null;
  if (process.env.NEXT_PUBLIC_ENABLE_AUTH === "true") {
    const { auth } = await import("@clerk/nextjs/server");
    const { isAuthenticated, userId } = await auth();
    if (!isAuthenticated) {
      return new Response(
        sse({ type: "error", message: "Sign in to use the AI assistant." }),
        { status: 401, headers: { "Content-Type": "text/event-stream" } }
      );
    }
    authUserId = userId;
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────
  let body: {
    message: string;
    previousResponseId?: string | null;
    invoiceData: InvoiceData;
    model?: string;
    files?: AttachedFile[];
  };

  try {
    body = await req.json();
  } catch {
    return new Response(
      sse({ type: "error", message: "Invalid JSON in request body" }),
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
  }

  // ── 3. Rate limit (only when Upstash env vars are set) ──────────────────
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(30, "1 h"),
      analytics: true,
    });
    const identifier =
      authUserId ||
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";
    const { success, limit, reset } = await ratelimit.limit(identifier);
    if (!success) {
      const minutesLeft = Math.ceil((reset - Date.now()) / 60_000);
      const timeLabel = minutesLeft <= 1 ? "less than a minute" : `${minutesLeft} minutes`;
      return new Response(
        sse({
          type: "error",
          message: `You've used all ${limit} AI requests for this hour. Resets in ${timeLabel}. You can still edit your invoice manually in the editor — it's always free.`,
        }),
        { status: 429, headers: { "Content-Type": "text/event-stream" } }
      );
    }
  }

  const { message, previousResponseId, invoiceData, model = "gpt-5.4-mini", files } = body;
  const invoiceAgent = createAgent(model);

  // Build multimodal content array when files are attached
  type ContentItem =
    | { type: "input_text"; text: string }
    | { type: "input_image"; image: string }
    | { type: "input_file"; file: { id: string }};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let agentInput: string | any[];

  if (files && files.length > 0) {
    const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const contentItems: ContentItem[] = [{ type: "input_text", text: message }];

    for (const f of files) {
      if (f.mimeType === "application/pdf") {
        const buffer = Buffer.from(f.base64, "base64");
        const fileObj = new File([buffer], f.name, { type: f.mimeType });
        const uploaded = await openaiClient.files.create({ file: fileObj, purpose: "user_data" });
        contentItems.push({ type: "input_file", file: { id: uploaded.id } });
      } else {
        // PNG / JPG — pass as data URL
        contentItems.push({ type: "input_image", image: `data:${f.mimeType};base64,${f.base64}` });
      }
    }

    // run() accepts AgentInputItem[] — wrap the user message in an array
    agentInput = [user(contentItems)];
  } else {
    agentInput = message;
  }

  const context: InvoiceContext = {
    invoiceData,
    patch: {},
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (obj: unknown) => {
        controller.enqueue(encoder.encode(sse(obj)));
      };

      try {
        const agentStream = await run(invoiceAgent, agentInput, {
          stream: true,
          previousResponseId: previousResponseId ?? undefined,
          context,
        });

        for await (const event of agentStream) {
          if (event.type === "raw_model_stream_event") {
            const data = event.data;
            if (
              data.type === "output_text_delta" &&
              "delta" in data &&
              typeof (data as { delta: unknown }).delta === "string"
            ) {
              enqueue({ type: "text", delta: (data as { delta: string }).delta });
            }
          } else if (
            event.type === "run_item_stream_event" &&
            event.name === "tool_output" &&
            event.item.type === "tool_call_output_item"
          ) {
            // Flush accumulated patch after each tool call completes
            if (Object.keys(context.patch).length > 0) {
              enqueue({ type: "patch", data: { ...context.patch } });
              context.patch = {};
            }
          }
        }

        // Flush any remaining patch (safety net)
        if (Object.keys(context.patch).length > 0) {
          enqueue({ type: "patch", data: context.patch });
        }

        enqueue({ type: "done", lastResponseId: agentStream.lastResponseId });
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        enqueue({ type: "error", message: errMessage });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
