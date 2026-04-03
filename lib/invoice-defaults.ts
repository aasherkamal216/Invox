import { v4 as uuidv4 } from "uuid";
import type { InvoiceData } from "./types";

export const DEFAULT_LABELS = {
  title: "INVOICE",
  invoiceNumber: "Invoice Number",
  date: "Date",
  dueDate: "Due Date",
  from: "From",
  to: "Bill To",
  description: "Description",
  quantity: "Qty",
  rate: "Rate",
  amount: "Amount",
  subtotal: "Subtotal",
  tax: "Tax",
  discount: "Discount",
  total: "Total",
  notes: "Notes",
  terms: "Terms & Conditions",
};

export const SAMPLE_INVOICE: InvoiceData = {
  id: uuidv4(),
  logoUrl: undefined,
  logoSize: 64,
  rowSpacing: 16,
  padding: 40,
  title: "INVOICE",
  invoiceNumber: "INV-0001",
  date: "2025-04-02",
  dueDate: "2025-05-02",
  fromDetails: "Acme Studio\n123 Design Street\nSan Francisco, CA 94102\ncontact@acmestudio.com",
  toDetails: "Bright Future Inc.\nAttn: Sarah Johnson\n456 Business Ave, Suite 200\nNew York, NY 10001",
  items: [
    { id: uuidv4(), description: "Brand Strategy & Research", quantity: 1, rate: 2500, amount: 2500 },
    { id: uuidv4(), description: "Logo Design (3 concepts)", quantity: 1, rate: 1800, amount: 1800 },
    { id: uuidv4(), description: "Brand Style Guide", quantity: 1, rate: 1200, amount: 1200 },
    { id: uuidv4(), description: "Social Media Templates", quantity: 5, rate: 150, amount: 750 },
  ],
  currency: "$",
  taxRate: 10,
  discount: 500,
  notes: "Thank you for your business! Payment can be made via bank transfer or credit card. Please include the invoice number as reference.",
  terms: "Payment due within 30 days of invoice date. Late payments subject to 1.5% monthly interest. All work remains property of Acme Studio until payment is received in full.",
  themeColor: "#f43f5e",
  template: "standard",
  fontFamily: "Inter, sans-serif",
  signature: undefined,
  labels: { ...DEFAULT_LABELS },
};

export const FONT_OPTIONS = [
  // From reference Image
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Outfit", value: "Outfit, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Sora", value: "Sora, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Playfair", value: "'Playfair Display', serif" },
  { label: "Libre Baskerville", value: "'Libre Baskerville', serif" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  // New Options (Not in image)
  { label: "Manrope", value: "Manrope, sans-serif" },
  { label: "Plus Jakarta", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "Figtree", value: "Figtree, sans-serif" },
  { label: "Urbanist", value: "Urbanist, sans-serif" },
  { label: "Lexend", value: "Lexend, sans-serif" },
  { label: "Public Sans", value: "'Public Sans', sans-serif" },
  { label: "Bitter", value: "Bitter, serif" },
];



export const TEMPLATES = [
  { id: "standard",  label: "Standard",  preview: "bg-white border-t-4 border-blue-500" },
  { id: "modern",    label: "Modern",    preview: "bg-slate-50 border-l-4 border-slate-800" },
  { id: "minimal",   label: "Minimal",   preview: "bg-white border border-gray-200" },
  { id: "classic",   label: "Classic",   preview: "bg-[#fdfbf7] border-double border-4 border-amber-900/20" },
  { id: "elegant",   label: "Elegant",   preview: "bg-white border-b border-gray-300" },
  { id: "bold",      label: "Bold",      preview: "bg-zinc-900 text-white" },
  { id: "corporate", label: "Corporate", preview: "bg-white border-t-8 border-indigo-600" },
  { id: "creative",  label: "Creative",  preview: "bg-gradient-to-br from-fuchsia-50 to-purple-50" },
  { id: "startup",   label: "Startup",   preview: "bg-white rounded-xl shadow-sm border border-emerald-100" },
  { id: "receipt",   label: "Receipt",   preview: "bg-yellow-50 font-mono border-dashed border-2 border-yellow-200" },
  { id: "gradient",  label: "Gradient",  preview: "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-inner ring-1 ring-white/20" },
  { id: "retro",     label: "Retro",     preview: "bg-amber-50 border border-amber-800/30 font-serif" },
] as const;
