"use client";

import { forwardRef } from "react";
import type { InvoiceData } from "@/lib/types";
import EditableField from "./EditableField";

interface InvoiceCanvasProps {
  invoice: InvoiceData;
  onChange: (updates: Partial<InvoiceData>) => void;
  isEditMode: boolean;
}

function calcTotals(invoice: InvoiceData) {
  const subtotal = invoice.items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount - invoice.discount;
  return { subtotal, taxAmount, total };
}

function fmt(currency: string, amount: number) {
  return `${currency.trim()} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const InvoiceCanvas = forwardRef<HTMLDivElement, InvoiceCanvasProps>(
  ({ invoice, onChange, isEditMode }, ref) => {
    const { subtotal, taxAmount, total } = calcTotals(invoice);
    const pad = invoice.padding ?? 40;
    const rowSpacing = invoice.rowSpacing ?? 16;
    const theme = invoice.themeColor;
    const font = invoice.fontFamily || "Inter, sans-serif";

    const updateLabel = (key: keyof typeof invoice.labels, val: string) =>
      onChange({ labels: { ...invoice.labels, [key]: val } });

    const updateItem = (id: string, field: string, value: string | number) =>
      onChange({
        items: invoice.items.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            updated.amount = Number(updated.quantity) * Number(updated.rate);
          }
          return updated;
        }),
      });

    const addItem = () =>
      onChange({
        items: [
          ...invoice.items,
          {
            id: crypto.randomUUID(),
            description: "New Item",
            quantity: 1,
            rate: 0,
            amount: 0,
          },
        ],
      });

    const removeItem = (id: string) =>
      onChange({ items: invoice.items.filter((i) => i.id !== id) });

    return (
      <div
        ref={ref}
        id="invoice-canvas"
        style={{
          width: 816,
          minHeight: 1056,
          backgroundColor: "#ffffff",
          fontFamily: font,
          fontSize: 14,
          color: "#1a1a1a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <TemplateContent
          invoice={invoice}
          isEditMode={isEditMode}
          onChange={onChange}
          updateLabel={updateLabel}
          updateItem={updateItem}
          addItem={addItem}
          removeItem={removeItem}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          pad={pad}
          rowSpacing={rowSpacing}
          theme={theme}
          fmt={fmt}
        />
      </div>
    );
  },
);

InvoiceCanvas.displayName = "InvoiceCanvas";
export default InvoiceCanvas;

// ─────────────────────────────────────────────────────────
// Shared prop types
// ─────────────────────────────────────────────────────────

interface TemplateProps {
  invoice: InvoiceData;
  isEditMode: boolean;
  onChange: (u: Partial<InvoiceData>) => void;
  updateLabel: (k: keyof InvoiceData["labels"], v: string) => void;
  updateItem: (id: string, field: string, value: string | number) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  subtotal: number;
  taxAmount: number;
  total: number;
  pad: number;
  rowSpacing: number;
  theme: string;
  fmt: (c: string, n: number) => string;
}

// Shorthand helper used in every template
function EF({
  value,
  onSave,
  type,
  className,
  style,
  placeholder,
  isEditMode,
}: {
  value: string;
  onSave: (v: string) => void;
  type?: "text" | "multiline" | "number" | "date";
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  isEditMode: boolean;
}) {
  return (
    <EditableField
      value={value}
      onChange={onSave}
      isEditMode={isEditMode}
      type={type}
      className={className}
      style={style}
      placeholder={placeholder}
    />
  );
}

// ─────────────────────────────────────────────────────────
// Template router — renders header then shared bottom
// ─────────────────────────────────────────────────────────

function TemplateContent(props: TemplateProps) {
  const { invoice, isEditMode, onChange, updateLabel, updateItem, addItem, removeItem, subtotal, taxAmount, total, pad, rowSpacing, theme, fmt } = props;

  const ef = (
    value: string,
    onSave: (v: string) => void,
    opts?: { type?: "text" | "multiline" | "number" | "date"; className?: string; style?: React.CSSProperties; placeholder?: string }
  ) => (
    <EF value={value} onSave={onSave} isEditMode={isEditMode} {...opts} />
  );

  // ── Items table (shared across all templates) ──────────

  const itemsTable = (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr style={{ background: theme, color: "#fff" }}>
            <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: "6px 0 0 6px" }}>
              {ef(invoice.labels.description, (v) => updateLabel("description", v), { style: { color: "#fff" } })}
            </th>
            <th style={{ textAlign: "center", padding: "10px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", width: 60 }}>
              {ef(invoice.labels.quantity, (v) => updateLabel("quantity", v), { style: { color: "#fff" } })}
            </th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", width: 90 }}>
              {ef(invoice.labels.rate, (v) => updateLabel("rate", v), { style: { color: "#fff" } })}
            </th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", width: 100, borderRadius: isEditMode ? "0" : "0 6px 6px 0" }}>
              {ef(invoice.labels.amount, (v) => updateLabel("amount", v), { style: { color: "#fff" } })}
            </th>
            {isEditMode && <th style={{ width: 28, borderRadius: "0 6px 6px 0", background: theme }} />}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: `${rowSpacing / 2}px 12px`, fontSize: 13 }}>
                {ef(item.description, (v) => updateItem(item.id, "description", v), { type: "multiline", placeholder: "Item description" })}
              </td>
              <td style={{ padding: `${rowSpacing / 2}px 12px`, textAlign: "center", fontSize: 13 }}>
                {ef(String(item.quantity), (v) => updateItem(item.id, "quantity", parseFloat(v) || 0), { type: "number", style: { textAlign: "center" } })}
              </td>
              <td style={{ padding: `${rowSpacing / 2}px 12px`, textAlign: "right", fontSize: 13, whiteSpace: "nowrap" }}>
                <span>{invoice.currency.trim()} </span>
                {ef(String(item.rate), (v) => updateItem(item.id, "rate", parseFloat(v) || 0), { type: "number", style: { textAlign: "right" } })}
              </td>
              <td style={{ padding: `${rowSpacing / 2}px 12px`, textAlign: "right", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
                {fmt(invoice.currency, item.amount)}
              </td>
              {isEditMode && (
                <td style={{ padding: "4px", textAlign: "center" }}>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}
                    title="Remove item"
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {isEditMode && (
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={addItem}
            style={{ background: "none", border: `1px dashed ${theme}`, borderRadius: 6, padding: "8px 16px", fontSize: 12, color: theme, cursor: "pointer" }}
          >
            + Add Line Item
          </button>
        </div>
      )}
    </>
  );

  // ── Totals + Notes/Terms (shared) ──────────────────────

  const totalsSection = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 64, marginTop: 48, marginBottom: 32 }}>
      <div style={{ flex: 1 }}>
        {(invoice.notes || isEditMode) && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
              {ef(invoice.labels.notes, (v) => updateLabel("notes", v))}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {ef(invoice.notes, (v) => onChange({ notes: v }), { type: "multiline", placeholder: "Add notes..." })}
            </div>
          </div>
        )}
        {(invoice.terms || isEditMode) && (
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
              {ef(invoice.labels.terms, (v) => updateLabel("terms", v))}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {ef(invoice.terms, (v) => onChange({ terms: v }), { type: "multiline", placeholder: "Add terms..." })}
            </div>
          </div>
        )}
      </div>
      <div style={{ minWidth: 260 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ whiteSpace: "nowrap" }}>{ef(invoice.labels.subtotal, (v) => updateLabel("subtotal", v))}</span>
          <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{fmt(invoice.currency, subtotal)}</span>
        </div>
        {invoice.taxRate > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ whiteSpace: "nowrap" }}>
              {ef(invoice.labels.tax, (v) => updateLabel("tax", v))} ({invoice.taxRate}%)
            </span>
            <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{fmt(invoice.currency, taxAmount)}</span>
          </div>
        )}
        {invoice.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#16a34a", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ whiteSpace: "nowrap" }}>{ef(invoice.labels.discount, (v) => updateLabel("discount", v))}</span>
            <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>-{fmt(invoice.currency, invoice.discount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", marginTop: 4, background: theme, borderRadius: 8, color: "#fff" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {ef(invoice.labels.total, (v) => updateLabel("total", v), { style: { color: "#fff" } })}
          </span>
          <span style={{ fontWeight: 800, fontSize: 16, whiteSpace: "nowrap" }}>{fmt(invoice.currency, total)}</span>
        </div>
      </div>
    </div>
  );

  // ── Signature (shared) ─────────────────────────────────

  const signature = invoice.signature && (
    <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ minWidth: 200, textAlign: "center" }}>
        <div style={{ borderBottom: "1px solid #d1d5db", paddingBottom: 8, marginBottom: 6 }}>
          {invoice.signature.type === "text" ? (
            <span style={{ fontFamily: "Georgia, serif", fontSize: 24, fontStyle: "italic", color: "#111827" }}>
              {invoice.signature.value}
            </span>
          ) : invoice.signature.value ? (
            <img src={invoice.signature.value} alt="Signature" style={{ height: 48, objectFit: "contain" }} />
          ) : null}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>
          Authorized Signature
        </div>
      </div>
    </div>
  );

  // ── Watermark (shared) ────────────────────────────────

  const watermark = invoice.showWatermark !== false && (
    <div style={{ marginTop: 28, paddingTop: 12, borderTop: "1px solid #e5e7eb", textAlign: "center" as const }}>
      <a
        href="https://invox.aasherkamal.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 9, letterSpacing: "0.06em", color: "#c4c9d4", textDecoration: "none" }}
      >
        POWERED BY{" "}
        <span style={{ fontWeight: 700, color: "#9ca3af" }}>INVOX</span>
      </a>
    </div>
  );

  const footer = (
    <>
      {signature}
      {watermark}
    </>
  );

  // ── Template header routing ────────────────────────────

  const t = invoice.template;

  // Standard
  if (t === "standard") {
    return (
      <div style={{ padding: pad }}>
        <div style={{ height: 6, background: theme, margin: `-${pad}px -${pad}px ${pad * 0.75}px -${pad}px` }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 64, objectFit: "contain", marginBottom: 12 }} />}
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>
              {ef(invoice.labels.from, (v) => updateLabel("from", v))}
            </div>
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, lineHeight: 1.6, color: "#374151", whiteSpace: "pre-line" }, placeholder: "Your Company Details" })}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "0.04em", color: theme, marginBottom: 8 }}>
              {ef(invoice.title, (v) => onChange({ title: v }))}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>{ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v))}</span>
              {" "}{ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { style: { color: "#111827", fontWeight: 500 } })}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>
              {ef(invoice.labels.date, (v) => updateLabel("date", v), { style: { fontWeight: 600, color: "#374151" } })}{": "}
              {ef(invoice.date, (v) => onChange({ date: v }), { type: "date" })}
            </div>
            {invoice.dueDate && (
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v), { style: { fontWeight: 600, color: "#374151" } })}{": "}
              {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date" })}
            </div>
            )}
          </div>
        </div>
        <div style={{ marginBottom: 28, padding: "16px 20px", background: "#f9fafb", borderRadius: 8, borderLeft: `3px solid ${theme}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>
            {ef(invoice.labels.to, (v) => updateLabel("to", v))}
          </div>
          {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line", color: "#374151" }, placeholder: "Client Details" })}
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Modern
  if (t === "modern") {
    return (
      <div style={{ padding: pad }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, paddingBottom: 24, borderBottom: `2px solid ${theme}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 80, objectFit: "contain" }} />}
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.03em", textTransform: "uppercase", color: theme }}>
              {ef(invoice.title, (v) => onChange({ title: v }))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v))}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }))}</span>
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", display: "flex", gap: 6, justifyContent: "flex-end" }}>
              {ef(invoice.labels.date, (v) => updateLabel("date", v))}
              {ef(invoice.date, (v) => onChange({ date: v }), { type: "date", style: { color: "#111827" } })}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, borderLeft: `3px solid ${theme}`, paddingLeft: 10, color: "#111827" }}>
              {ef(invoice.labels.from, (v) => updateLabel("from", v))}
            </div>
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#6b7280", lineHeight: 1.6, whiteSpace: "pre-line" }, placeholder: "Your Company Details" })}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, borderLeft: `3px solid ${theme}`, paddingLeft: 10, color: "#111827" }}>
              {ef(invoice.labels.to, (v) => updateLabel("to", v))}
            </div>
            {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#6b7280", lineHeight: 1.6, whiteSpace: "pre-line" }, placeholder: "Client Details" })}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 32, padding: 20, background: "#f9fafb", borderRadius: 12 }}>
          {invoice.dueDate && (
          <div style={{ flex: "1 1 120px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>{ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v))}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date" })}</div>
          </div>
          )}
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Minimal
  if (t === "minimal") {
    return (
      <div style={{ padding: pad }}>
        <div style={{ textAlign: "center", marginTop: 16, marginBottom: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 64, objectFit: "contain", marginBottom: 20 }} />}
          <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111827", marginBottom: 12 }}>
            {ef(invoice.title, (v) => onChange({ title: v }))}
          </div>
          <div style={{ width: 48, height: 1, background: theme, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, color: "#6b7280", fontSize: 13, letterSpacing: "0.1em" }}>
            {ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v))}
            {ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginBottom: 48, fontSize: 13 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 10 }}>{ef(invoice.labels.from, (v) => updateLabel("from", v))}</div>
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }, placeholder: "Your Company Details" })}
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 10 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v))}</div>
            {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }, placeholder: "Client Details" })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 4 }}>{ef(invoice.labels.date, (v) => updateLabel("date", v))}</div>
              {ef(invoice.date, (v) => onChange({ date: v }), { type: "date", style: { color: "#374151" } })}
            </div>
            {invoice.dueDate && (
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 4 }}>{ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v))}</div>
              {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date", style: { color: "#374151" } })}
            </div>
            )}
          </div>
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Classic
  if (t === "classic") {
    return (
      <div style={{ padding: pad, fontFamily: "Georgia, serif" }}>
        <div style={{ textAlign: "center", borderBottom: `3px double ${theme}`, paddingBottom: 24, marginBottom: 24 }}>
          {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 80, objectFit: "contain", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />}
          <div style={{ fontSize: 36, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: theme, marginBottom: 8 }}>
            {ef(invoice.title, (v) => onChange({ title: v }))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, color: "#6b7280" }}>
            {ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { placeholder: "Invoice No:" })}
            {ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { placeholder: "INV-0001" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, textTransform: "uppercase", color: "#111827", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>
              {ef(invoice.labels.from, (v) => updateLabel("from", v), { placeholder: "From" })}
            </div>
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }, placeholder: "Your Company Details" })}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, textTransform: "uppercase", color: "#111827", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>
              {ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "Bill To" })}
            </div>
            {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }, placeholder: "Client Details" })}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, background: "#f9fafb", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 13 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {ef(invoice.labels.date, (v) => updateLabel("date", v), { style: { fontWeight: 700 } })}
            {ef(invoice.date, (v) => onChange({ date: v }), { type: "date" })}
          </div>
          {invoice.dueDate && (
          <div style={{ display: "flex", gap: 8 }}>
            {ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v), { style: { fontWeight: 700 } })}
            {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date" })}
          </div>
          )}
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Elegant
  if (t === "elegant") {
    return (
      <div style={{ padding: pad, fontWeight: 300 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}>
          <div>
            <div style={{ fontSize: 44, letterSpacing: "0.15em", color: "#d1d5db", textTransform: "uppercase", marginBottom: 16 }}>
              {ef(invoice.title, (v) => onChange({ title: v }))}
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#6b7280" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: "0.08em" }}>{ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { placeholder: "Inv No." })}</span>
                <span style={{ color: "#111827" }}>{ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { placeholder: "INV-0001" })}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: "0.08em" }}>{ef(invoice.labels.date, (v) => updateLabel("date", v), { placeholder: "Date" })}</span>
                <span style={{ color: "#111827" }}>{ef(invoice.date, (v) => onChange({ date: v }), { type: "date" })}</span>
              </div>
              {invoice.dueDate && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: "0.08em" }}>{ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v), { placeholder: "Due" })}</span>
                <span style={{ color: "#111827" }}>{ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date" })}</span>
              </div>
              )}
            </div>
          </div>
          {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 64, objectFit: "contain" }} />}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 16 }}>{ef(invoice.labels.from, (v) => updateLabel("from", v), { placeholder: "From" })}</div>
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-line" }, placeholder: "Your Details" })}
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 16 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "To" })}</div>
            {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-line" }, placeholder: "Client Details" })}
          </div>
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Bold
  if (t === "bold") {
    return (
      <div style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch", marginBottom: 0 }}>
          <div style={{ width: "50%", padding: "48px 40px", backgroundColor: theme, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 44, fontWeight: 900, textTransform: "uppercase", marginBottom: 8 }}>
              {ef(invoice.title, (v) => onChange({ title: v }), { style: { color: "#fff" } })}
            </div>
            <div style={{ fontSize: 18, opacity: 0.8, display: "flex", gap: 8 }}>
              {ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { style: { color: "#fff" }, placeholder: "#" })}
              {ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { style: { color: "#fff" }, placeholder: "0001" })}
            </div>
          </div>
          <div style={{ width: "50%", padding: "48px 40px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 80, objectFit: "contain" }} />}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, padding: `32px ${pad}px`, marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", color: theme, marginBottom: 8, fontSize: 12 }}>{ef(invoice.labels.from, (v) => updateLabel("from", v), { placeholder: "From" })}</div>
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", whiteSpace: "pre-line" }, placeholder: "Your Details" })}
          </div>
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", color: theme, marginBottom: 8, fontSize: 12 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "To" })}</div>
            {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", whiteSpace: "pre-line" }, placeholder: "Client Details" })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "#6b7280", fontSize: 13 }}>{ef(invoice.labels.date, (v) => updateLabel("date", v))}</span>
              {ef(invoice.date, (v) => onChange({ date: v }), { type: "date", style: { fontSize: 13 } })}
            </div>
            {invoice.dueDate && (
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "#6b7280", fontSize: 13 }}>{ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v))}</span>
              {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date", style: { fontSize: 13 } })}
            </div>
            )}
          </div>
        </div>
        <div style={{ padding: `0 ${pad}px ${pad}px` }}>
          {itemsTable}
          {totalsSection}
          {footer}
        </div>
      </div>
    );
  }

  // Corporate
  if (t === "corporate") {
    return (
      <div style={{ padding: pad }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: `4px solid ${theme}`, paddingBottom: 24 }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 64, objectFit: "contain" }} />}
            <div style={{ borderLeft: `2px solid ${theme}`, paddingLeft: 20 }}>
              <div style={{ fontSize: 26, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#1f2937" }}>
                {ef(invoice.title, (v) => onChange({ title: v }))}
              </div>
              <div style={{ display: "flex", gap: 8, color: "#6b7280", marginTop: 4, fontSize: 13 }}>
                {ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { placeholder: "Invoice No:" })}
                <span style={{ fontWeight: 500, color: "#111827" }}>{ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { placeholder: "INV-0001" })}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 13 }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 4 }}>
              {ef(invoice.labels.date, (v) => updateLabel("date", v), { style: { color: "#6b7280" }, placeholder: "Date:" })}
              {ef(invoice.date, (v) => onChange({ date: v }), { type: "date", style: { fontWeight: 500 } })}
            </div>
            {invoice.dueDate && (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              {ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v), { style: { color: "#6b7280" }, placeholder: "Due Date:" })}
              {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date", style: { fontWeight: 500 } })}
            </div>
            )}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32, background: "#f9fafb", padding: 24, borderRadius: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", marginBottom: 8 }}>{ef(invoice.labels.from, (v) => updateLabel("from", v), { placeholder: "From" })}</div>
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#1f2937", whiteSpace: "pre-line" }, placeholder: "Your Details" })}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", marginBottom: 8 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "To" })}</div>
            {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#1f2937", whiteSpace: "pre-line" }, placeholder: "Client Details" })}
          </div>
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Creative
  if (t === "creative") {
    return (
      <div style={{ padding: pad }}>
        <div style={{ display: "flex", gap: 48, marginBottom: 32 }}>
          <div style={{ width: "33%" }}>
            {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 80, objectFit: "contain", marginBottom: 24 }} />}
            <div>
              <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 12, color: theme, marginBottom: 8 }}>{ef(invoice.labels.from, (v) => updateLabel("from", v), { placeholder: "From" })}</div>
              {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#6b7280", whiteSpace: "pre-line" }, placeholder: "Your Details" })}
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 12, color: theme, marginBottom: 8 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "To" })}</div>
              {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#6b7280", whiteSpace: "pre-line" }, placeholder: "Client Details" })}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 56, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.04em", color: theme, marginBottom: 24 }}>
              {ef(invoice.title, (v) => onChange({ title: v }))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: "#f9fafb", padding: 24, borderRadius: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>{ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { placeholder: "Inv No" })}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { placeholder: "INV-0001" })}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>{ef(invoice.labels.date, (v) => updateLabel("date", v), { placeholder: "Date" })}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{ef(invoice.date, (v) => onChange({ date: v }), { type: "date" })}</div>
              </div>
              {invoice.dueDate && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>{ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v), { placeholder: "Due" })}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date" })}</div>
              </div>
              )}
            </div>
          </div>
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Startup
  if (t === "startup") {
    return (
      <div style={{ padding: pad }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {invoice.logoUrl && (
              <div style={{ padding: 10, borderRadius: 16, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 48, objectFit: "contain" }} />
              </div>
            )}
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, fontWeight: 500, color: "#1f2937", whiteSpace: "pre-line" }, placeholder: "Your Company" })}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              {ef(invoice.title, (v) => onChange({ title: v }), { placeholder: "Invoice" })}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 9999, fontSize: 13, fontWeight: 500, backgroundColor: `${theme}22`, color: theme }}>
              {ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { placeholder: "#" })}
              {ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { placeholder: "0001" })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, padding: 32, borderRadius: 24, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <div style={{ width: "45%" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: 8 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "Billed To" })}</div>
            {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 14, color: "#111827", whiteSpace: "pre-line" }, placeholder: "Client Details" })}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 40, textAlign: "right" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: 8 }}>{ef(invoice.labels.date, (v) => updateLabel("date", v), { placeholder: "Issued" })}</div>
              {ef(invoice.date, (v) => onChange({ date: v }), { type: "date", style: { fontSize: 14, fontWeight: 500, color: "#111827" } })}
            </div>
            {invoice.dueDate && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginBottom: 8 }}>{ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v), { placeholder: "Due" })}</div>
              {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date", style: { fontSize: 14, fontWeight: 500, color: "#111827" } })}
            </div>
            )}
          </div>
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Receipt
  if (t === "receipt") {
    return (
      <div style={{ padding: pad, fontFamily: "'Courier New', monospace" }}>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 24, borderBottom: "2px dashed #d1d5db", paddingBottom: 24 }}>
            {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 64, objectFit: "contain", filter: "grayscale(100%)", display: "block", margin: "0 auto 16px" }} />}
            <div style={{ fontSize: 22, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>
              {ef(invoice.title, (v) => onChange({ title: v }))}
            </div>
            {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#6b7280", marginBottom: 12, whiteSpace: "pre-line" }, placeholder: "Your Details" })}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 13 }}>
              {ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { placeholder: "Receipt #:" })}
              {ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { placeholder: "0001" })}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 4, fontSize: 13 }}>
              {ef(invoice.labels.date, (v) => updateLabel("date", v), { placeholder: "Date:" })}
              {ef(invoice.date, (v) => onChange({ date: v }), { type: "date" })}
            </div>
            {invoice.dueDate && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 4, fontSize: 13 }}>
              {ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v), { placeholder: "Due:" })}
              {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date" })}
            </div>
            )}
          </div>
          <div style={{ marginBottom: 24, borderBottom: "2px dashed #d1d5db", paddingBottom: 24 }}>
            <div style={{ fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "Bill To:" })}</div>
            {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#6b7280", whiteSpace: "pre-line" }, placeholder: "Client Details" })}
          </div>
        </div>
        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Gradient
  if (t === "gradient") {
    return (
      <div style={{ padding: 0 }}>
        {/* Full-bleed gradient header */}
        <div
          style={{
            position: "relative",
            padding: `${pad}px`,
            paddingBottom: 32,
            marginBottom: 32,
            background: `linear-gradient(135deg, ${theme} 0%, ${theme}cc 60%, ${theme} 100%)`,
            overflow: "hidden",
            borderRadius: "0 0 32px 32px",
          }}
        >
          <div style={{ position: "absolute", top: 0, right: 0, width: 256, height: 256, borderRadius: "50%", background: "rgba(255,255,255,0.08)", transform: "translate(33%, -33%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)", transform: "translate(-50%, 50%)" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 56, objectFit: "contain", filter: "brightness(0) invert(1)" }} />}
              <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase", color: "rgba(255,255,255,0.95)" }}>
                {ef(invoice.title, (v) => onChange({ title: v }), { style: { color: "rgba(255,255,255,0.95)" } })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 8, alignItems: "center" }}>
                {ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { style: { color: "rgba(255,255,255,0.6)", fontSize: 13 }, placeholder: "No." })}
                {ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { style: { color: "#fff", fontWeight: 700, fontSize: 16 }, placeholder: "INV-0001" })}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", fontSize: 13, marginBottom: 4 }}>
                {ef(invoice.labels.date, (v) => updateLabel("date", v), { style: { color: "rgba(255,255,255,0.6)" } })}
                {ef(invoice.date, (v) => onChange({ date: v }), { type: "date", style: { color: "#fff", fontWeight: 500 } })}
              </div>
              {invoice.dueDate && (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", fontSize: 13 }}>
                {ef(invoice.labels.dueDate, (v) => updateLabel("dueDate", v), { style: { color: "rgba(255,255,255,0.6)" } })}
                {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date", style: { color: "#fff", fontWeight: 500 } })}
              </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: `0 ${pad}px ${pad}px` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <div style={{ padding: 20, borderRadius: 12, background: "#f9fafb" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: theme, marginBottom: 8 }}>{ef(invoice.labels.from, (v) => updateLabel("from", v), { placeholder: "From" })}</div>
              {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }, placeholder: "Your Company Details" })}
            </div>
            <div style={{ padding: 20, borderRadius: 12, background: "#f9fafb" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: theme, marginBottom: 8 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "Bill To" })}</div>
              {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }, placeholder: "Client Details" })}
            </div>
          </div>
          {itemsTable}
          {totalsSection}
          {footer}
        </div>
      </div>
    );
  }

  // Retro
  if (t === "retro") {
    const retroColor = theme || "#92400e";
    return (
      <div style={{ padding: pad, fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 64, objectFit: "contain", display: "block", margin: "0 auto 16px" }} />}
          <div style={{ fontSize: 44, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: retroColor, marginBottom: 12 }}>
            {ef(invoice.title, (v) => onChange({ title: v }))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <div style={{ height: 1, width: 48, background: retroColor }} />
            <div style={{ display: "flex", gap: 8, color: "#6b7280", fontStyle: "italic", fontSize: 13 }}>
              {ef(invoice.labels.invoiceNumber, (v) => updateLabel("invoiceNumber", v), { placeholder: "No." })}
              {ef(invoice.invoiceNumber, (v) => onChange({ invoiceNumber: v }), { placeholder: "INV-0001" })}
            </div>
            <div style={{ height: 1, width: 48, background: retroColor }} />
          </div>
        </div>

        {/* Metadata stamp row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, padding: "10px 16px", borderTop: `1px solid ${retroColor}44`, borderBottom: `1px solid ${retroColor}44` }}>
          <div style={{ display: "flex", gap: 32, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.12em", color: retroColor, marginBottom: 2 }}>Issued</div>
              {ef(invoice.date, (v) => onChange({ date: v }), { type: "date", style: { color: "#374151", fontStyle: "italic" } })}
            </div>
            {invoice.dueDate && (
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.12em", color: retroColor, marginBottom: 2 }}>Due</div>
              {ef(invoice.dueDate, (v) => onChange({ dueDate: v }), { type: "date", style: { color: "#374151", fontStyle: "italic" } })}
            </div>
            )}
          </div>
          {/* Wax-seal badge */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: `3px solid ${retroColor}`, display: "flex", alignItems: "center", justifyContent: "center", background: `${retroColor}10` }}>
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: retroColor, textAlign: "center", lineHeight: 1.3 }}>Est.<br />Co.</span>
            </div>
          </div>
        </div>

        {/* From / To */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.12em", color: retroColor, marginBottom: 12 }}>{ef(invoice.labels.from, (v) => updateLabel("from", v), { placeholder: "Bill From" })}</div>
            <div style={{ borderLeft: `2px solid ${retroColor}`, paddingLeft: 12 }}>
              {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", lineHeight: 1.6, fontStyle: "italic", whiteSpace: "pre-line" }, placeholder: "Your Company Details" })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.12em", color: retroColor, marginBottom: 12 }}>{ef(invoice.labels.to, (v) => updateLabel("to", v), { placeholder: "Bill To" })}</div>
            <div style={{ borderLeft: `2px solid ${retroColor}`, paddingLeft: 12 }}>
              {ef(invoice.toDetails, (v) => onChange({ toDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", lineHeight: 1.6, fontStyle: "italic", whiteSpace: "pre-line" }, placeholder: "Client Details" })}
            </div>
          </div>
        </div>

        {/* Decorative rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: `repeating-linear-gradient(90deg, ${retroColor} 0px, ${retroColor} 4px, transparent 4px, transparent 8px)` }} />
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: retroColor }}>Services</div>
          <div style={{ flex: 1, height: 1, background: `repeating-linear-gradient(90deg, ${retroColor} 0px, ${retroColor} 4px, transparent 4px, transparent 8px)` }} />
        </div>

        {itemsTable}
        {totalsSection}
        {footer}
      </div>
    );
  }

  // Fallback to standard
  return (
    <div style={{ padding: pad }}>
      <div style={{ height: 6, background: theme, margin: `-${pad}px -${pad}px ${pad * 0.75}px -${pad}px` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          {invoice.logoUrl && <img src={invoice.logoUrl} alt="Logo" style={{ height: invoice.logoSize ?? 64, objectFit: "contain", marginBottom: 12 }} />}
          {ef(invoice.fromDetails, (v) => onChange({ fromDetails: v }), { type: "multiline", style: { fontSize: 13, color: "#374151", whiteSpace: "pre-line" }, placeholder: "Your Company Details" })}
        </div>
        <div style={{ textAlign: "right", fontSize: 36, fontWeight: 800, color: theme }}>
          {ef(invoice.title, (v) => onChange({ title: v }))}
        </div>
      </div>
      {itemsTable}
      {totalsSection}
      {footer}
    </div>
  );
}
