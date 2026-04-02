"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { InvoiceData } from "@/lib/types";
import { FONT_OPTIONS, TEMPLATES, DEFAULT_LABELS, SAMPLE_INVOICE } from "@/lib/invoice-defaults";
import { clearInvoice } from "@/lib/storage";
import { cn } from "@/lib/utils";
import SignaturePad from "./SignaturePad";
import { ChevronDown, ImagePlus, Plus, Trash2, Undo2, Ban, Eraser, Check, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsPanelProps {
  invoice: InvoiceData;
  onChange: (updates: Partial<InvoiceData>) => void;
  onReset: () => void;
}

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between py-3 px-3 text-sm font-semibold transition-colors rounded-lg hover:bg-muted/50",
        open ? "bg-muted/30 text-foreground" : "text-muted-foreground"
      )}
    >
      {label}
      <ChevronDown
        className={cn("w-4 h-4 transition-transform duration-200", open ? "rotate-180" : "")}
      />
    </button>
  );
}

function FieldRow({ label, children, valueRight }: { label: string; children: React.ReactNode; valueRight?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <Label className="text-sm font-medium text-foreground/80">{label}</Label>
        {valueRight && <span className="text-xs text-muted-foreground">{valueRight}</span>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPanel({ invoice, onChange, onReset }: SettingsPanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    branding: true,
    template: true,
    invoice: true,
    parties: false,
    customFields: false,
    items: false,
    financials: false,
    notes: false,
    signature: false,
    labels: false,
  });

  const toggle = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ logoUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddItem = () =>
    onChange({
      items: [
        ...invoice.items,
        { id: crypto.randomUUID(), description: "New Item", quantity: 1, rate: 0, amount: 0 },
      ],
    });

  const handleRemoveItem = (id: string) =>
    onChange({ items: invoice.items.filter((i) => i.id !== id) });

  const handleItemChange = (id: string, field: string, value: string | number) =>
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

  return (
    <div className="flex flex-col h-full w-1/3 min-w-[360px] max-w-[480px] border-r border-border bg-sidebar shrink-0 shadow-sm z-10 transition-all">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-background/50 backdrop-blur-sm flex justify-between items-start gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Invoice Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Customize appearance</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger
            render={(props) => (
              <Button
                {...props}
                variant="destructive"
                size="sm"
                className="gap-1.5 h-8 px-3 text-xs font-medium transition-all group"
              >
                <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform duration-300" />
                Reset
              </Button>
            )}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Invoice Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will wipe all current data and start from scratch. This action cannot be undone. All fields and details will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose
                render={(props) => (
                  <Button {...props} variant="outline">
                    Cancel
                  </Button>
                )}
              />
              <AlertDialogClose
                onClick={onReset}
                render={(props) => (
                  <Button {...props} variant="destructive">
                    Yes, Wipe Data
                  </Button>
                )}
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 flex flex-col gap-2">

          {/* ── Branding & Layout ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Branding & Layout" open={openSections.branding} onToggle={() => toggle("branding")} />
            {openSections.branding && (
              <div className="flex flex-col gap-5 p-4 pt-2">
                {/* Logo */}
                <div>
                  <Label className="text-sm font-medium text-foreground/80 mb-2 block px-1">Logo</Label>
                  {invoice.logoUrl ? (
                    <div className="relative w-20 h-20 group">
                      <img src={invoice.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg border border-border bg-white" />
                      <button
                        onClick={() => onChange({ logoUrl: undefined })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all w-full"
                    >
                      <ImagePlus className="w-6 h-6 text-muted-foreground/60" />
                      <span className="text-sm text-muted-foreground font-medium">Upload logo</span>
                    </div>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>

                {/* Logo size */}
                {invoice.logoUrl && (
                  <FieldRow label="Logo Size" valueRight={`${invoice.logoSize ?? 64}px`}>
                    <Slider
                      value={[invoice.logoSize ?? 64]}
                      onValueChange={(vals) => onChange({ logoSize: Array.isArray(vals) ? vals[0] : vals as number })}
                      min={32} max={160} step={4}
                      className="py-1"
                    />
                  </FieldRow>
                )}

                {/* Padding */}
                <FieldRow label="Padding" valueRight={`${invoice.padding ?? 40}px`}>
                  <Slider
                    value={[invoice.padding ?? 40]}
                    onValueChange={(vals) => onChange({ padding: Array.isArray(vals) ? vals[0] : (vals as number) })}
                    min={16} max={80} step={4}
                    className="py-1"
                  />
                </FieldRow>

                {/* Row spacing */}
                <FieldRow label="Row Spacing" valueRight={`${invoice.rowSpacing ?? 16}px`}>
                  <Slider
                    value={[invoice.rowSpacing ?? 16]}
                    onValueChange={(vals) => onChange({ rowSpacing: Array.isArray(vals) ? vals[0] : (vals as number) })}
                    min={8} max={32} step={2}
                    className="py-1"
                  />
                </FieldRow>

                {/* Font */}
                <div>
                  <Label className="text-sm font-medium text-foreground/80 mb-2 block px-1">Typography</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_OPTIONS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => onChange({ fontFamily: f.value })}
                        className={cn(
                          "h-11 rounded-xl border text-[13px] font-medium transition-all px-2 flex items-center justify-center text-center leading-tight",
                          (invoice.fontFamily || "Inter, sans-serif") === f.value
                            ? "border-foreground bg-muted text-foreground ring-0.5 ring-foreground/20 font-bold shadow-sm"
                            : "border-border/60 bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted/30 hover:text-foreground",
                        )}
                        style={{ fontFamily: f.value }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Theme Color */}
                <FieldRow label="Theme Color">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border shadow-sm group">
                      <input
                        type="color"
                        value={invoice.themeColor}
                        onChange={(e) => onChange({ themeColor: e.target.value })}
                        className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer m-0 p-0"
                      />
                    </div>
                    <Input
                      value={invoice.themeColor}
                      onChange={(e) => onChange({ themeColor: e.target.value })}
                      className="h-8 text-sm font-mono flex-1 uppercase tracking-wider font-medium"
                      maxLength={7}
                    />
                  </div>
                </FieldRow>
              </div>
            )}
          </div>

          {/* ── Template ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Template Design" open={openSections.template} onToggle={() => toggle("template")} />
            {openSections.template && (
              <div className="p-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onChange({ template: t.id })}
                      className={cn(
                        "relative flex items-center justify-center gap-2 h-14 rounded-lg border text-sm font-medium transition-all px-3",
                        invoice.template === t.id
                          ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {invoice.template === t.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className="w-5 h-5 rounded shadow-sm opacity-90 border border-primary/20"
                        style={{ background: invoice.template === t.id ? invoice.themeColor : "#e5e7eb" }}
                      />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Invoice Info ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Document Details" open={openSections.invoice} onToggle={() => toggle("invoice")} />
            {openSections.invoice && (
              <div className="flex flex-col gap-4 p-4 pt-2">
                <FieldRow label="Document Title">
                  <Input value={invoice.title} onChange={(e) => onChange({ title: e.target.value })} className="h-8 text-sm" placeholder="INVOICE" />
                </FieldRow>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Invoice #">
                    <Input value={invoice.invoiceNumber} onChange={(e) => onChange({ invoiceNumber: e.target.value })} className="h-8 text-sm" placeholder="INV-001" />
                  </FieldRow>
                  <FieldRow label="Currency">
                    <Input value={invoice.currency} onChange={(e) => onChange({ currency: e.target.value })} className="h-8 text-sm font-mono text-center" maxLength={3} placeholder="$" />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Issue Date">
                    <Input type="date" value={invoice.date} onChange={(e) => onChange({ date: e.target.value })} className="h-8 text-sm block" />
                  </FieldRow>
                  <FieldRow label="Due Date">
                    <Input type="date" value={invoice.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} className="h-8 text-sm block" />
                  </FieldRow>
                </div>
              </div>
            )}
          </div>

          {/* ── From & To ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Entities" open={openSections.parties} onToggle={() => toggle("parties")} />
            {openSections.parties && (
              <div className="flex flex-col gap-4 p-4 pt-2">
                <FieldRow label="From (Your Business)">
                  <Textarea
                    value={invoice.fromDetails}
                    onChange={(e) => onChange({ fromDetails: e.target.value })}
                    className="text-sm resize-none min-h-[100px] leading-relaxed"
                    placeholder="Your company name&#10;Address&#10;City, State ZIP&#10;email@company.com"
                  />
                </FieldRow>
                <FieldRow label="Bill To (Client)">
                  <Textarea
                    value={invoice.toDetails}
                    onChange={(e) => onChange({ toDetails: e.target.value })}
                    className="text-sm resize-none min-h-[100px] leading-relaxed"
                    placeholder="Client name&#10;Address&#10;City, State ZIP"
                  />
                </FieldRow>
              </div>
            )}
          </div>

          {/* ── Custom Fields ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Custom Info Details" open={openSections.customFields} onToggle={() => toggle("customFields")} />
            {openSections.customFields && (
              <div className="flex flex-col gap-3 p-4 pt-2">
                {invoice.customFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 group">
                    <Input
                      value={field.label}
                      onChange={(e) => onChange({ customFields: invoice.customFields.map((f) => f.id === field.id ? { ...f, label: e.target.value } : f) })}
                      className="h-10 text-sm w-5/12 font-medium"
                      placeholder="e.g. PO Number"
                    />
                    <Input
                      value={field.value}
                      onChange={(e) => onChange({ customFields: invoice.customFields.map((f) => f.id === field.id ? { ...f, value: e.target.value } : f) })}
                      className="h-10 text-sm flex-1"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => onChange({ customFields: invoice.customFields.filter((f) => f.id !== field.id) })}
                      className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-all shrink-0"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="h-10 text-sm mt-1 border-dashed border-border/60 hover:border-primary/50 text-muted-foreground w-full flex gap-2 items-center"
                  onClick={() => onChange({ customFields: [...invoice.customFields, { id: crypto.randomUUID(), label: "New Field", value: "" }] })}
                >
                  <Plus className="w-4 h-4" /> Add Custom Field
                </Button>
              </div>
            )}
          </div>

          {/* ── Line Items ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Line Items" open={openSections.items} onToggle={() => toggle("items")} />
            {openSections.items && (
              <div className="flex flex-col gap-3 p-4 pt-2">
                {invoice.items.map((item, idx) => (
                  <div key={item.id} className="border border-border/80 rounded-xl p-3 flex flex-col gap-3 bg-muted/20 shadow-sm group relative transition-all hover:border-border">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Item {idx + 1}</span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all absolute top-2.5 right-2 p-1 bg-background/80 rounded"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                      className="h-8 text-sm font-medium"
                      placeholder="Service or Product Description"
                    />

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <Label className="text-xs text-muted-foreground mb-1 block px-1">Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm px-2 text-center"
                          min={0}
                        />
                      </div>
                      <div className="col-span-4">
                        <Label className="text-xs text-muted-foreground mb-1 block px-1">Rate</Label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5 text-muted-foreground/60 text-sm">{invoice.currency}</span>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, "rate", parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm pl-7 pr-2 font-mono"
                            min={0}
                          />
                        </div>
                      </div>
                      <div className="col-span-5">
                        <Label className="text-xs text-muted-foreground mb-1 block px-1 truncate">Amount</Label>
                        <div className="h-8 flex items-center justify-end text-sm font-semibold px-3 border border-border/60 rounded-md bg-background shadow-inner font-mono text-foreground/90">
                          {invoice.currency}{item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="default"
                  className="h-8 text-sm w-full font-medium flex gap-2 items-center shadow-sm"
                  onClick={handleAddItem}
                >
                  <Plus className="w-4 h-4" /> Add Line Item
                </Button>
              </div>
            )}
          </div>

          {/* ── Financials ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Taxes & Discounts" open={openSections.financials} onToggle={() => toggle("financials")} />
            {openSections.financials && (
              <div className="p-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow label="Tax Rate (%)">
                    <Input
                      type="number"
                      value={invoice.taxRate}
                      onChange={(e) => onChange({ taxRate: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-sm font-mono"
                      min={0} max={100} step={0.5}
                      placeholder="0.0"
                    />
                  </FieldRow>
                  <FieldRow label={`Discount (${invoice.currency})`}>
                    <Input
                      type="number"
                      value={invoice.discount}
                      onChange={(e) => onChange({ discount: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-sm font-mono"
                      min={0}
                      placeholder="0.00"
                    />
                  </FieldRow>
                </div>
              </div>
            )}
          </div>

          {/* ── Notes & Terms ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Notes & Terms" open={openSections.notes} onToggle={() => toggle("notes")} />
            {openSections.notes && (
              <div className="flex flex-col gap-4 p-4 pt-2">
                <FieldRow label="Notes to Client">
                  <Textarea
                    value={invoice.notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    className="text-sm resize-none min-h-[80px]"
                    placeholder="Thank you for your business! Payment is much appreciated."
                  />
                </FieldRow>
                <FieldRow label="Terms & Conditions">
                  <Textarea
                    value={invoice.terms}
                    onChange={(e) => onChange({ terms: e.target.value })}
                    className="text-sm resize-none min-h-[80px]"
                    placeholder="Please pay within 30 days of receiving this invoice."
                  />
                </FieldRow>
              </div>
            )}
          </div>

          {/* ── Signature ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Signature Validation" open={openSections.signature} onToggle={() => toggle("signature")} />
            {openSections.signature && (
              <div className="flex flex-col gap-4 p-4 pt-2">
                <div className="flex gap-2 p-1 bg-muted/40 rounded-lg border border-border/50">
                  <Button
                    size="sm"
                    variant={!invoice.signature || invoice.signature.type === "text" ? "default" : "ghost"}
                    className="flex-1 h-8 text-xs font-medium"
                    onClick={() => onChange({ signature: { type: "text", value: invoice.signature?.value || "" } })}
                  >
                    Type
                  </Button>
                  <Button
                    size="sm"
                    variant={invoice.signature?.type === "draw" ? "default" : "ghost"}
                    className="flex-1 h-8 text-xs font-medium"
                    onClick={() => onChange({ signature: { type: "draw", value: "" } })}
                  >
                    Draw
                  </Button>
                </div>

                {(!invoice.signature || invoice.signature.type === "text") && (
                  <FieldRow label="Typed Signature">
                    <Input
                      value={invoice.signature?.value || ""}
                      onChange={(e) => onChange({ signature: { type: "text", value: e.target.value } })}
                      className="h-8 text-lg italic bg-background"
                      placeholder="Your Full Name"
                      style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive, serif" }}
                    />
                  </FieldRow>
                )}

                {invoice.signature?.type === "draw" && (
                  <div className="bg-white rounded-lg border border-border shadow-inner p-1">
                    <SignaturePad
                      value={invoice.signature.value}
                      onChange={(v) => onChange({ signature: { type: "draw", value: v } })}
                    />
                  </div>
                )}

                {invoice.signature && (
                  <Button
                    variant="outline"
                    className="h-9 text-xs text-destructive border-destructive/20 w-full"
                    onClick={() => onChange({ signature: undefined })}
                  >
                    <Eraser className="w-3.5 h-3.5 mr-2" /> Remove Signature
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* ── Label Customization ── */}
          <div className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
            <SectionHeader label="Translation / Labels" open={openSections.labels} onToggle={() => toggle("labels")} />
            {openSections.labels && (
              <div className="flex flex-col gap-3 p-4 pt-2">
                <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/40">Rename invoice fields for your language or terminology.</p>

                <div className="space-y-2 mt-1">
                  {(Object.keys(DEFAULT_LABELS) as (keyof typeof DEFAULT_LABELS)[]).map((key) => (
                    <div key={key} className="flex items-center gap-2 group">
                      <Label className="text-xs font-medium text-foreground/70 w-28 shrink-0 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</Label>
                      <Input
                        value={invoice.labels[key]}
                        onChange={(e) => onChange({ labels: { ...invoice.labels, [key]: e.target.value } })}
                        className="h-8 text-sm flex-1 bg-background group-hover:border-primary/40 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="h-8 mt-2 w-full flex items-center justify-center gap-2 text-xs"
                  onClick={() => onChange({ labels: { ...DEFAULT_LABELS } })}
                >
                  <Undo2 className="w-3.5 h-3.5 mr-2" /> Reset Defaults
                </Button>
              </div>
            )}
          </div>



          {/* Bottom padding */}
          <div className="h-6" />
        </div>
      </ScrollArea>
    </div>
  );
}
