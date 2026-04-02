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
  return `${currency}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        {/* ── TEMPLATE RENDERER ── */}
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
// Template routing — additional templates in next turn
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

function TemplateContent(props: TemplateProps) {
  // All templates share the same layout for now — full template differentiation in next turn
  return <StandardTemplate {...props} />;
}

// ─── Standard Template ────────────────────────────────────

function StandardTemplate({
  invoice,
  isEditMode,
  onChange,
  updateLabel,
  updateItem,
  addItem,
  removeItem,
  subtotal,
  taxAmount,
  total,
  pad,
  rowSpacing,
  theme,
  fmt,
}: TemplateProps) {
  const EF = (props: {
    value: string;
    onSave: (v: string) => void;
    type?: "text" | "multiline" | "number" | "date";
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
  }) => (
    <EditableField
      value={props.value}
      onChange={props.onSave}
      isEditMode={isEditMode}
      type={props.type}
      className={props.className}
      style={props.style}
      placeholder={props.placeholder}
    />
  );

  return (
    <div style={{ padding: pad }}>
      {/* ── Top accent bar ── */}
      <div style={{ height: 6, background: theme, margin: `-${pad}px -${pad}px ${pad}px -${pad}px` }} />

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        {/* Left: Logo + From */}
        <div>
          {invoice.logoUrl && (
            <img
              src={invoice.logoUrl}
              alt="Logo"
              style={{ height: invoice.logoSize ?? 64, objectFit: "contain", marginBottom: 12 }}
            />
          )}
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>
            <EF value={invoice.labels.from} onSave={(v) => updateLabel("from", v)} className="text-gray-400" />
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line", color: "#374151" }}>
            <EF
              value={invoice.fromDetails}
              onSave={(v) => onChange({ fromDetails: v })}
              type="multiline"
              style={{ whiteSpace: "pre-line", fontSize: 13, lineHeight: 1.6, color: "#374151" }}
              placeholder="Your company name&#10;Address&#10;City, State ZIP&#10;email@company.com"
            />
          </div>
        </div>

        {/* Right: Title + invoice meta */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "0.04em", color: theme, marginBottom: 8 }}>
            <EF value={invoice.title} onSave={(v) => onChange({ title: v })} className="font-extrabold" />
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>
              <EF value={invoice.labels.invoiceNumber} onSave={(v) => updateLabel("invoiceNumber", v)} />
            </span>
            {" "}
            <EF value={invoice.invoiceNumber} onSave={(v) => onChange({ invoiceNumber: v })} style={{ color: "#111827", fontWeight: 500 }} />
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>
            <EF value={invoice.labels.date} onSave={(v) => updateLabel("date", v)} style={{ fontWeight: 600, color: "#374151" }} />
            {": "}
            <EF value={invoice.date} onSave={(v) => onChange({ date: v })} type="date" />
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            <EF value={invoice.labels.dueDate} onSave={(v) => updateLabel("dueDate", v)} style={{ fontWeight: 600, color: "#374151" }} />
            {": "}
            <EF value={invoice.dueDate} onSave={(v) => onChange({ dueDate: v })} type="date" />
          </div>
        </div>
      </div>

      {/* ── Bill To ── */}
      <div style={{ marginBottom: 28, padding: "16px 20px", background: "#f9fafb", borderRadius: 8, borderLeft: `3px solid ${theme}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>
          <EF value={invoice.labels.to} onSave={(v) => updateLabel("to", v)} />
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line", color: "#374151" }}>
          <EF
            value={invoice.toDetails}
            onSave={(v) => onChange({ toDetails: v })}
            type="multiline"
            style={{ whiteSpace: "pre-line", fontSize: 13, lineHeight: 1.6 }}
            placeholder="Client name&#10;Address&#10;City, State ZIP"
          />
        </div>
      </div>

      {/* ── Custom Fields ── */}
      {(invoice.customFields.length > 0 || isEditMode) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {invoice.customFields.map((field) => (
            <div
              key={field.id}
              style={{
                position: "relative",
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                padding: "8px 14px",
                minWidth: 100,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: theme, marginBottom: 3 }}>
                <EF value={field.label} onSave={(v) => onChange({ customFields: invoice.customFields.map((f) => f.id === field.id ? { ...f, label: v } : f) })} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#111827" }}>
                <EF value={field.value} onSave={(v) => onChange({ customFields: invoice.customFields.map((f) => f.id === field.id ? { ...f, value: v } : f) })} />
              </div>
              {isEditMode && (
                <button
                  onClick={() => onChange({ customFields: invoice.customFields.filter((f) => f.id !== field.id) })}
                  style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {isEditMode && (
            <button
              onClick={() => onChange({ customFields: [...invoice.customFields, { id: crypto.randomUUID(), label: "Label", value: "Value" }] })}
              style={{ background: "none", border: `1px dashed ${theme}`, borderRadius: 8, padding: "8px 14px", fontSize: 11, color: theme, cursor: "pointer", minWidth: 80 }}
            >
              + Add Field
            </button>
          )}
        </div>
      )}

      {/* ── Items Table ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr style={{ background: theme, color: "#fff" }}>
            <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: "6px 0 0 6px" }}>
              <EF value={invoice.labels.description} onSave={(v) => updateLabel("description", v)} style={{ color: "#fff" }} />
            </th>
            <th style={{ textAlign: "center", padding: "10px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", width: 60 }}>
              <EF value={invoice.labels.quantity} onSave={(v) => updateLabel("quantity", v)} style={{ color: "#fff" }} />
            </th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", width: 90 }}>
              <EF value={invoice.labels.rate} onSave={(v) => updateLabel("rate", v)} style={{ color: "#fff" }} />
            </th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", width: 100, borderRadius: "0 6px 6px 0" }}>
              <EF value={invoice.labels.amount} onSave={(v) => updateLabel("amount", v)} style={{ color: "#fff" }} />
            </th>
            {isEditMode && <th style={{ width: 28 }} />}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr
              key={item.id}
              style={{
                background: idx % 2 === 0 ? "#fff" : "#fafafa",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <td style={{ padding: `${rowSpacing / 2}px 12px`, fontSize: 13 }}>
                <EF value={item.description} onSave={(v) => updateItem(item.id, "description", v)} placeholder="Item description" />
              </td>
              <td style={{ padding: `${rowSpacing / 2}px 12px`, textAlign: "center", fontSize: 13 }}>
                <EF value={String(item.quantity)} onSave={(v) => updateItem(item.id, "quantity", parseFloat(v) || 0)} type="number" style={{ textAlign: "center" }} />
              </td>
              <td style={{ padding: `${rowSpacing / 2}px 12px`, textAlign: "right", fontSize: 13 }}>
                <EF value={String(item.rate)} onSave={(v) => updateItem(item.id, "rate", parseFloat(v) || 0)} type="number" style={{ textAlign: "right" }} />
              </td>
              <td style={{ padding: `${rowSpacing / 2}px 12px`, textAlign: "right", fontSize: 13, fontWeight: 500 }}>
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

      {/* ── Bottom Section: Notes/Terms side-by-side with Totals ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 64, marginTop: 48, marginBottom: 32 }}>
        {/* Left: Notes & Terms */}
        <div style={{ flex: 1 }}>
          {(invoice.notes || isEditMode) && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>
                <EF value={invoice.labels.notes} onSave={(v) => updateLabel("notes", v)} />
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                <EF value={invoice.notes} onSave={(v) => onChange({ notes: v })} type="multiline" placeholder="Add notes..." />
              </div>
            </div>
          )}
          {(invoice.terms || isEditMode) && (
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>
                <EF value={invoice.labels.terms} onSave={(v) => updateLabel("terms", v)} />
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                <EF value={invoice.terms} onSave={(v) => onChange({ terms: v })} type="multiline" placeholder="Add terms..." />
              </div>
            </div>
          )}
        </div>

        {/* Right: Totals */}
        <div style={{ minWidth: 260 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ whiteSpace: "nowrap" }}><EF value={invoice.labels.subtotal} onSave={(v) => updateLabel("subtotal", v)} /></span>
            <span style={{ fontWeight: 500 }}>{fmt(invoice.currency, subtotal)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ whiteSpace: "nowrap" }}>
                <EF value={invoice.labels.tax} onSave={(v) => updateLabel("tax", v)} />
                {" "}({invoice.taxRate}%)
              </span>
              <span style={{ fontWeight: 500 }}>{fmt(invoice.currency, taxAmount)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#16a34a", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ whiteSpace: "nowrap" }}><EF value={invoice.labels.discount} onSave={(v) => updateLabel("discount", v)} /></span>
              <span style={{ fontWeight: 500 }}>-{fmt(invoice.currency, invoice.discount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", marginTop: 4, background: theme, borderRadius: 8, color: "#fff" }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              <EF value={invoice.labels.total} onSave={(v) => updateLabel("total", v)} style={{ color: "#fff" }} />
            </span>
            <span style={{ fontWeight: 800, fontSize: 16 }}>{fmt(invoice.currency, total)}</span>
          </div>
        </div>
      </div>

      {/* ── Signature ── */}
      {invoice.signature && (
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
      )}
    </div>
  );
}
