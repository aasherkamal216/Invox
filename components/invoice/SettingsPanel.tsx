"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import type { InvoiceData } from "@/lib/types";
import { FONT_OPTIONS, TEMPLATES, DEFAULT_LABELS, SAMPLE_INVOICE } from "@/lib/invoice-defaults";
import { cn } from "@/lib/utils";
import SignaturePad from "./SignaturePad";
import { ChevronDown, ImagePlus, Plus, Trash2, Undo2, Eraser, Check, CalendarIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface SettingsPanelProps {
  invoice: InvoiceData;
  onChange: (updates: Partial<InvoiceData>) => void;
}

function SectionCollapsible({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border border-border/50 rounded-xl bg-background/50 shadow-sm overflow-hidden">
      <CollapsibleTrigger
        className={cn(
          "w-full flex items-center justify-between py-3 px-3 text-sm font-semibold transition-colors rounded-lg hover:bg-muted/50",
          "text-muted-foreground data-[open]:bg-muted/30 data-[open]:text-foreground"
        )}
      >
        {label}
        <ChevronDown
          className={cn("w-4 h-4 transition-transform duration-200 [[data-open]_&]:rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        {children}
      </CollapsiblePanel>
    </Collapsible>
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

export default function SettingsPanel({ invoice, onChange }: SettingsPanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);

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
        } else if (field === "amount") {
          updated.quantity = 1;
          updated.rate = Number(value);
        }
        return updated;
      }),
    });

  return (
    <div className="flex flex-col h-full bg-sidebar w-full overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-3 flex flex-col gap-2">

          {/* ── Branding & Layout ── */}
          <SectionCollapsible label="Branding & Layout" defaultOpen>
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
                <Select
                  value={invoice.fontFamily || "Inter, sans-serif"}
                  onValueChange={(val) => onChange({ fontFamily: val ?? undefined })}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl" style={{ fontFamily: invoice.fontFamily || "Inter, sans-serif" }}>
                    <SelectValue placeholder="Select a font">
                      {FONT_OPTIONS.find(f => f.value === (invoice.fontFamily || "Inter, sans-serif"))?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem
                        key={f.value}
                        value={f.value}
                        style={{ fontFamily: f.value }}
                        className="text-base"
                      >
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </SectionCollapsible>

          {/* ── Template ── */}
          <SectionCollapsible label="Template Design" defaultOpen>
            <div className="p-4 pt-2">
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onChange({ template: t.id })}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all group",
                      invoice.template === t.id
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5 scale-[1.02]"
                        : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/5",
                    )}
                  >
                    <div className={cn("w-full h-14 rounded-lg flex flex-col items-center justify-start overflow-hidden relative shadow-sm transition-transform group-hover:scale-[1.02]", t.preview)}>
                      {/* Skeleton layout */}
                      <div className="absolute inset-0 p-1 opacity-20 flex flex-col gap-1 pointer-events-none">
                        {t.id === "gradient" ? (
                          <div className="w-full h-1/2 bg-white/40 rounded-sm mb-1" />
                        ) : t.id === "bold" ? (
                          <div className="w-full h-full bg-white/10 rounded-sm" />
                        ) : t.id === "standard" || t.id === "corporate" ? (
                          <div className="w-full h-1.5 bg-current opacity-20 rounded-full mb-1" />
                        ) : null}
                        <div className="flex justify-between w-full">
                          <div className="w-1/3 h-1 bg-current opacity-30 rounded-full" />
                          <div className="w-1/4 h-1 bg-current opacity-30 rounded-full" />
                        </div>
                        <div className="w-full h-[1px] bg-current opacity-10 my-1" />
                        <div className="space-y-0.5 mt-auto">
                          <div className="w-full h-1 bg-current opacity-20 rounded-sm" />
                          <div className="w-full h-1 bg-current opacity-10 rounded-sm" />
                          <div className="w-2/3 h-1 bg-current opacity-10 rounded-sm" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold tracking-tight text-muted-foreground/80 group-hover:text-foreground transition-colors">{t.label}</span>
                    {invoice.template === t.id && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                        <Check className="w-2 h-2" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </SectionCollapsible>

          {/* ── Invoice Info ── */}
          <SectionCollapsible label="Document Details" defaultOpen>
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
                  <DatePicker 
                    date={invoice.date} 
                    onChange={(d) => onChange({ date: d })} 
                    className="h-8 text-sm"
                  />
                </FieldRow>
                <FieldRow
                  label="Due Date"
                  valueRight={
                    invoice.dueDate ? (
                      <button
                        onClick={() => onChange({ dueDate: undefined })}
                        className="text-xs text-muted-foreground hover:text-destructive underline"
                      >
                        Remove
                      </button>
                    ) : undefined
                  }
                >
                  <DatePicker
                    date={invoice.dueDate ?? undefined}
                    onChange={(d) => onChange({ dueDate: d })}
                    className="h-8 text-sm"
                    placeholder="No due date"
                  />
                </FieldRow>
              </div>
            </div>
          </SectionCollapsible>

          {/* ── From & To ── */}
          <SectionCollapsible label="Entities">
            <div className="flex flex-col gap-4 p-4 pt-2">
              <FieldRow label="From (Your Business)">
                <Textarea
                  value={invoice.fromDetails}
                  onChange={(e) => onChange({ fromDetails: e.target.value })}
                  className="text-sm resize-none min-h-[100px] leading-relaxed"
                  placeholder={"Your company name\nAddress\nCity, State ZIP\nemail@company.com"}
                />
              </FieldRow>
              <FieldRow label="Bill To (Client)">
                <Textarea
                  value={invoice.toDetails}
                  onChange={(e) => onChange({ toDetails: e.target.value })}
                  className="text-sm resize-none min-h-[100px] leading-relaxed"
                  placeholder={"Client name\nAddress\nCity, State ZIP"}
                />
              </FieldRow>
            </div>
          </SectionCollapsible>

          {/* ── Line Items ── */}
          <SectionCollapsible label="Line Items">
            <div className="flex flex-col gap-3 p-4 pt-2">
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground/80">Amount only</span>
                  <span className="text-xs text-muted-foreground">Hide Qty &amp; Rate columns</span>
                </div>
                <Switch
                  checked={invoice.hideQtyRate === true}
                  onCheckedChange={(checked) => onChange({ hideQtyRate: checked })}
                />
              </div>
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

                  {invoice.hideQtyRate ? (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block px-1">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-muted-foreground/60 text-sm">{invoice.currency}</span>
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleItemChange(item.id, "amount", parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm pl-7 pr-2 font-mono"
                          min={0}
                        />
                      </div>
                    </div>
                  ) : (
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
                  )}
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
          </SectionCollapsible>

          {/* ── Financials ── */}
          <SectionCollapsible label="Taxes & Discounts">
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
          </SectionCollapsible>

          {/* ── Notes & Terms ── */}
          <SectionCollapsible label="Notes & Terms">
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
          </SectionCollapsible>

          {/* ── Signature ── */}
          <SectionCollapsible label="Signature Validation">
            <div className="flex flex-col gap-4 p-4 pt-2">
              {/* Signature Type/Draw toggle using coss Tabs */}
              <Tabs
                defaultValue={invoice.signature?.type || "text"}
                onValueChange={(val) => {
                  if (val === "text") {
                    onChange({ signature: { type: "text", value: invoice.signature?.value || "" } });
                  } else {
                    onChange({ signature: { type: "draw", value: "" } });
                  }
                }}
              >
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTab value="text" className="text-xs font-medium h-8">Type</TabsTab>
                  <TabsTab value="draw" className="text-xs font-medium h-8">Draw</TabsTab>
                </TabsList>

                <TabsPanel value="text" className="mt-3">
                  <FieldRow label="Typed Signature">
                    <Input
                      value={invoice.signature?.value || ""}
                      onChange={(e) => onChange({ signature: { type: "text", value: e.target.value } })}
                      className="h-8 text-lg italic bg-background"
                      placeholder="Your Full Name"
                      style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive, serif" }}
                    />
                  </FieldRow>
                </TabsPanel>

                <TabsPanel value="draw" className="mt-3">
                  <div className="bg-white rounded-lg border border-border shadow-inner p-1">
                    <SignaturePad
                      value={invoice.signature?.value ?? ""}
                      onChange={(v) => onChange({ signature: { type: "draw", value: v } })}
                    />
                  </div>
                </TabsPanel>
              </Tabs>

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
          </SectionCollapsible>

          {/* ── Watermark ── */}
          <SectionCollapsible label="Watermark">
            <div className="flex items-center justify-between p-4 pt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground/80">Show watermark</span>
                <span className="text-xs text-muted-foreground">Display "Powered by Invox" at the bottom</span>
              </div>
              <Switch
                checked={invoice.showWatermark !== false}
                onCheckedChange={(checked) => onChange({ showWatermark: checked })}
              />
            </div>
          </SectionCollapsible>

          {/* ── Label Customization ── */}
          <SectionCollapsible label="Translation / Labels">
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
          </SectionCollapsible>

          {/* Bottom padding */}
          <div className="h-6" />
        </div>
      </ScrollArea>
    </div>
  );
}
