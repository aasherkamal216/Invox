"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import type { InvoiceData, ChatMessage } from "@/lib/types";
import { SAMPLE_INVOICE } from "@/lib/invoice-defaults";
import { saveInvoice, loadInvoice, clearInvoice } from "@/lib/storage";
import EditorToolbar from "./EditorToolbar";
import ChatPanel from "./ChatPanel";
import InvoiceCanvas from "./InvoiceCanvas";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Sparkles, Settings, X, Download } from "lucide-react";
import { useIsMobile } from "@/hooks/use-media-query";

const SettingsPanel = dynamic(() => import("./SettingsPanel"), { ssr: false });

const INITIAL_MESSAGES: ChatMessage[] = [];

export default function InvoiceEditor() {
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    if (typeof window !== "undefined") {
      return loadInvoice() ?? { ...SAMPLE_INVOICE, id: uuidv4() };
    }
    return { ...SAMPLE_INVOICE, id: uuidv4() };
  });

  const [isEditMode, setIsEditMode] = useState(true);
  const [scale, setScale] = useState(0.85);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [activeTab, setActiveTab] = useState<"settings" | "ai">("settings");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"settings" | "ai" | null>(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const isMobile = useIsMobile();

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const openMobilePanel = (panel: "settings" | "ai") => {
    setMobilePanel(panel);
    requestAnimationFrame(() => requestAnimationFrame(() => setMobilePanelOpen(true)));
  };

  const closeMobilePanel = () => {
    setMobilePanelOpen(false);
    setTimeout(() => setMobilePanel(null), 300);
  };

  // Persist to localStorage on every invoice change
  useEffect(() => {
    saveInvoice(invoice);
  }, [invoice]);

  // Auto-fit scale on mount and resize
  useEffect(() => {
    // On desktop in edit mode, use 1:1 scale; on mobile always fit to width
    if (isEditMode && !isMobile) {
      setScale(1);
      return;
    }

    const fit = () => {
      if (!isAutoFit && !isMobile) return;
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (isMobile) {
        // Fit canvas to viewport width with a small margin
        setScale(Math.min((width - 16) / 816, 1));
      } else {
        const scaleW = (width - 80) / 816;
        const scaleH = (height - 80) / 1056;
        setScale(Math.min(scaleW, scaleH, 1));
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [activeTab, isEditMode, isAutoFit, isMobile]);

  // Keyboard shortcuts for zooming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditMode) return;

      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setIsAutoFit(false);
        setScale((s) => Math.min(s + 0.1, 2));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setIsAutoFit(false);
        setScale((s) => Math.max(s - 0.1, 0.25));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setIsAutoFit(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditMode]);

  const updateInvoice = useCallback((updates: Partial<InvoiceData>) => {
    setInvoice((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = () => {
    clearInvoice();
    setInvoice({ ...SAMPLE_INVOICE, id: uuidv4() });
    setMessages([]);
    setPreviousResponseId(null);
    toast.success("Invoice reset to default");
  };

  const handleNewChat = () => {
    setMessages([]);
    setPreviousResponseId(null);
  };

  const handleZoomIn = () => {
    if (isEditMode) return;
    setIsAutoFit(false);
    setScale((s) => Math.min(s + 0.1, 2));
  };
  const handleZoomOut = () => {
    if (isEditMode) return;
    setIsAutoFit(false);
    setScale((s) => Math.max(s - 0.1, 0.25));
  };
  const handleZoomFit = () => {
    if (isEditMode) {
      setScale(1);
      return;
    }
    setIsAutoFit(true);
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scaleW = (width - 80) / 816;
    const scaleH = (height - 80) / 1056;
    setScale(Math.min(scaleW, scaleH, 1));
  };

  const handleDownloadPDF = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading("Generating PDF...");
    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      // Temporarily switch to preview mode so edit UI (dashed borders, delete buttons) is hidden
      const wasEditMode = isEditMode;
      if (wasEditMode) {
        setIsEditMode(false);
        await new Promise((r) => setTimeout(r, 150));
      }

      const el = canvasRef.current;
      const actualHeight = el.scrollHeight;

      // WORKAROUND: Temporarily disable stylesheets that cause the 'cssRules' access error
      const sheets = Array.from(document.styleSheets);
      const crossOriginSheets: CSSStyleSheet[] = [];
      for (const sheet of sheets) {
        try {
          // Attempt to access cssRules to trigger the security error if it exists
          const _ = sheet.cssRules;
        } catch (e) {
          // If it fails, disable the stylesheet temporarily and track it
          sheet.disabled = true;
          crossOriginSheets.push(sheet);
        }
      }

      const imgData = await toPng(el, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: 816,
        height: actualHeight,
        style: { transform: "scale(1)", transformOrigin: "top left", margin: "0", position: "static" },
      });

      // Restore the disabled stylesheets
      for (const sheet of crossOriginSheets) {
        sheet.disabled = false;
      }

      if (wasEditMode) setIsEditMode(true);

      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [816, actualHeight] });
      pdf.addImage(imgData, "PNG", 0, 0, 816, actualHeight);
      pdf.save(`${invoice.invoiceNumber || "invoice"}.pdf`);

      toast.success("PDF downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendMessage = async (
    prompt: string,
    model = "gpt-5.4-mini",
    files?: { name: string; mimeType: string; base64: string }[],
    attachments?: { name: string; mimeType: string; preview?: string }[]
  ) => {
    const userMsg: ChatMessage = { role: "user", text: prompt, attachments };
    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, previousResponseId, invoiceData: invoice, model, files }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `Error: Server returned ${res.status}. Please try again.` },
        ]);
        return;
      }

      // Add an empty assistant bubble that will be filled as text streams in
      setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              setMessages((prev) => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                if (last?.role === "assistant") {
                  msgs[msgs.length - 1] = { ...last, text: last.text + event.delta };
                }
                return msgs;
              });
            } else if (event.type === "patch") {
              updateInvoice(event.data);
            } else if (event.type === "done") {
              setPreviousResponseId(event.lastResponseId);
              setIsGenerating(false);
            } else if (event.type === "error") {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", text: `Error: ${event.message}` },
              ]);
              setIsGenerating(false);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      <EditorToolbar
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((v) => !v)}
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onDownloadPDF={handleDownloadPDF}
        isExporting={isExporting}
        onReset={handleReset}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <div className="hidden md:flex flex-col h-full w-1/3 min-w-[360px] max-w-[480px] border-r border-border bg-sidebar shrink-0 shadow-sm z-10 transition-all">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "settings" | "ai")} className="flex flex-col h-full data-[orientation=horizontal]:flex-col">
            <div className="px-3 pt-3 pb-2 border-b border-border bg-background/50 backdrop-blur-sm shrink-0">
              <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-lg">
                <TabsTab value="settings" className="font-semibold text-xs h-8">
                  <Settings className="w-3.5 h-3.5 mr-1" />
                  Settings
                </TabsTab>
                <TabsTab value="ai" className="font-semibold text-xs h-8">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  AI Assistant
                </TabsTab>
              </TabsList>
            </div>

            <TabsPanel value="settings" className="flex-1 overflow-hidden">
              <SettingsPanel invoice={invoice} onChange={updateInvoice} />
            </TabsPanel>

            <TabsPanel value="ai" className="flex-1 overflow-hidden">
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                onNewChat={handleNewChat}
                isGenerating={isGenerating}
              />
            </TabsPanel>
          </Tabs>
        </div>

        {/* ── Canvas Area ── */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-[#f0f0f0] flex items-start justify-center py-2 md:py-8"
          style={{ backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          onWheel={(e) => {
            if (isEditMode) return;
            if (e.altKey || e.ctrlKey || e.metaKey) {
              e.preventDefault();
              setIsAutoFit(false);
              setScale((s) => Math.max(0.25, Math.min(2, s - e.deltaY * 0.001)));
            }
          }}
        >
          {/* Shadow + canvas wrapper */}
          <div
            className="transition-all duration-300 ease-in-out"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              width: 816,
              height: 1056,
              display: "flex",
              flexDirection: "column",
              marginBottom: -1056 * (1 - scale),
              marginRight: -816 * ((1 - scale) / 2),
              marginLeft: -816 * ((1 - scale) / 2),
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 20px 60px -10px rgba(0,0,0,0.2)",
              borderRadius: 2,
            }}
          >
            <InvoiceCanvas
              ref={canvasRef}
              invoice={invoice}
              onChange={updateInvoice}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <div
        className="md:hidden flex items-stretch border-t border-border bg-background shrink-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          onClick={() => openMobilePanel("settings")}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:bg-muted"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>

        <button
          onClick={() => openMobilePanel("ai")}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:bg-muted"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium">AI Chat</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:bg-muted disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px] font-medium">Export</span>
        </button>
      </div>

      {/* ── Mobile Slide-Up Panel ── */}
      {mobilePanel && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 transition-opacity duration-300"
            style={{ opacity: mobilePanelOpen ? 1 : 0 }}
            onClick={closeMobilePanel}
          />

          {/* Panel */}
          <div
            className="relative bg-background rounded-t-2xl flex flex-col transition-transform duration-300 ease-out"
            style={{
              height: "88dvh",
              transform: mobilePanelOpen ? "translateY(0)" : "translateY(100%)",
            }}
          >
            {/* Drag handle + header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                {mobilePanel === "settings"
                  ? <Settings className="w-4 h-4 text-muted-foreground" />
                  : <Sparkles className="w-4 h-4 text-muted-foreground" />
                }
                <span className="text-sm font-semibold">
                  {mobilePanel === "settings" ? "Settings" : "AI Assistant"}
                </span>
              </div>
              <button
                onClick={closeMobilePanel}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {mobilePanel === "settings" ? (
                <SettingsPanel invoice={invoice} onChange={updateInvoice} />
              ) : (
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onNewChat={handleNewChat}
                  isGenerating={isGenerating}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
