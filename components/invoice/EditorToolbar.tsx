"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, FileText, Edit3, Eye, ZoomOut, Maximize, ZoomIn, Download } from "lucide-react";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator } from "@/components/ui/toolbar";
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

interface EditorToolbarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onDownloadPDF: () => void;
  isExporting: boolean;
  onReset: () => void;
}

export default function EditorToolbar({
  isEditMode,
  onToggleEditMode,
  scale,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onDownloadPDF,
  isExporting,
  onReset,
}: EditorToolbarProps) {
  return (
    <header className="h-12 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-10">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1.5 group">
          <Image src="/3d.png" alt="Invox Logo" width={24} height={24} className="rounded-md" />
          <span className="text-sm font-semibold tracking-tight group-hover:opacity-80 transition-opacity">
            Invox
          </span>
        </Link>
      </div>

      {/* Center: Edit / Preview toggle (coss Tabs) */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Tabs
          value={isEditMode ? "edit" : "preview"}
          onValueChange={(val) => {
            if (val === "edit" && !isEditMode) onToggleEditMode();
            if (val === "preview" && isEditMode) onToggleEditMode();
          }}
        >
          <TabsList className="h-auto">
            <TabsTab value="edit" className="text-xs font-semibold h-7 px-3 gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </TabsTab>
            <TabsTab value="preview" className="text-xs font-semibold h-7 px-3 gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      {/* Right: Zoom Toolbar + Reset + Download */}
      <div className="flex items-center gap-3">
        {/* Zoom Controls — desktop only */}
        <Toolbar className="hidden md:flex border-0 bg-muted/30 p-0.5 rounded-lg shadow-none gap-0">
          <ToolbarGroup className="gap-0">
            <ToolbarButton
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onZoomOut}
                  title="Zoom out"
                  disabled={isEditMode}
                  className={cn(isEditMode && "opacity-30 cursor-not-allowed")}
                />
              }
            >
              <ZoomOut className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              render={
                <button
                  onClick={onZoomFit}
                  disabled={isEditMode}
                  className={cn(
                    "text-[11px] font-mono font-medium text-muted-foreground w-12 text-center transition-colors px-1",
                    !isEditMode ? "hover:text-foreground cursor-pointer" : "opacity-30 cursor-not-allowed"
                  )}
                  title={isEditMode ? "Zoom disabled in Edit mode" : "Click to fit"}
                />
              }
            >
              {isEditMode ? "100%" : `${Math.round(scale * 100)}%`}
            </ToolbarButton>

            <ToolbarButton
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onZoomIn}
                  title="Zoom in"
                  disabled={isEditMode}
                  className={cn(isEditMode && "opacity-30 cursor-not-allowed")}
                />
              }
            >
              <ZoomIn className="w-4 h-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarSeparator orientation="vertical" className="h-5" />

          <ToolbarButton
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onZoomFit}
                title="Fit to screen"
                disabled={isEditMode}
                className={cn(isEditMode && "opacity-30 cursor-not-allowed", "hover:bg-primary/10 hover:text-primary")}
              />
            }
          >
            <Maximize className="w-4 h-4" />
          </ToolbarButton>
        </Toolbar>

        <div className="flex items-center gap-2">
          {/* Reset — desktop: text+icon, mobile: icon only */}
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
                  <span className="hidden md:inline">Reset</span>
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

          <Button
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5"
            onClick={onDownloadPDF}
            loading={isExporting}
            disabled={isExporting}
          >
            {!isExporting && <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
