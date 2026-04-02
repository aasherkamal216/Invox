"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  aiPanelOpen: boolean;
  onToggleAI: () => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onDownloadPDF: () => void;
  isExporting: boolean;
}

export default function EditorToolbar({
  isEditMode,
  onToggleEditMode,
  aiPanelOpen,
  onToggleAI,
  scale,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onDownloadPDF,
  isExporting,
}: EditorToolbarProps) {
  return (
    <header className="h-12 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-10">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight group-hover:opacity-80 transition-opacity">
            Invoice<span className="text-primary">AI</span>
          </span>
        </Link>
      </div>

      {/* Center: Edit / Preview toggle */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
        <button
          onClick={() => !isEditMode && onToggleEditMode()}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
            isEditMode
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => isEditMode && onToggleEditMode()}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
            !isEditMode
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>
      </div>

      {/* Right: Zoom + AI + Download */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg px-1">
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={onZoomOut} 
            title="Zoom out"
            disabled={isEditMode}
            className={cn(isEditMode && "opacity-30 cursor-not-allowed")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </Button>
          <button
            onClick={onZoomFit}
            disabled={isEditMode}
            className={cn(
              "text-[11px] font-mono font-medium text-muted-foreground w-12 text-center transition-colors px-1",
              !isEditMode ? "hover:text-foreground cursor-pointer" : "opacity-30 cursor-not-allowed"
            )}
            title={isEditMode ? "Zoom disabled in Edit mode" : "Click to fit"}
          >
            {isEditMode ? "100%" : `${Math.round(scale * 100)}%`}
          </button>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={onZoomIn} 
            title="Zoom in"
            disabled={isEditMode}
            className={cn(isEditMode && "opacity-30 cursor-not-allowed")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={onZoomFit} 
            title="Fit to screen"
            disabled={isEditMode}
            className={cn(isEditMode && "opacity-30 cursor-not-allowed", "hover:bg-primary/10 hover:text-primary")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <polyline points="9 9 15 15" />
              <polyline points="15 9 9 15" />
            </svg>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={aiPanelOpen ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onToggleAI}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            AI
          </Button>

          <Button
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5"
            onClick={onDownloadPDF}
            loading={isExporting}
            disabled={isExporting}
          >
            {!isExporting && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            Download
          </Button>
        </div>
      </div>
    </header>
  );
}
