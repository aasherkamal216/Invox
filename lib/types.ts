export type InvoiceField = {
  id: string;
  label: string;
  value: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

export type InvoiceLabels = {
  title: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  from: string;
  to: string;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  notes: string;
  terms: string;
};

export type Template =
  | "standard"
  | "modern"
  | "minimal"
  | "classic"
  | "elegant"
  | "bold"
  | "corporate"
  | "creative"
  | "startup"
  | "receipt"
  | "gradient"
  | "retro";

export type InvoiceData = {
  id: string;
  logoUrl?: string;
  logoSize?: number;
  rowSpacing?: number;
  padding?: number;
  title: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  fromDetails: string;
  toDetails: string;
  customFields: InvoiceField[];
  items: InvoiceItem[];
  currency: string;
  taxRate: number;
  discount: number;
  notes: string;
  terms: string;
  themeColor: string;
  template: Template;
  fontFamily?: string;
  signature?: { type: "text" | "draw"; value: string };
  labels: InvoiceLabels;
};

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};
