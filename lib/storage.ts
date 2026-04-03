import type { InvoiceData } from "./types";

const STORAGE_KEY = "invox_draft";

export function saveInvoice(data: InvoiceData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function loadInvoice(): InvoiceData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InvoiceData;
  } catch {
    return null;
  }
}

export function clearInvoice(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
