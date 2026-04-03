"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { List, Palette, Sparkles, ChevronDown, ArrowUp, SquarePen, Plus } from "lucide-react";

const MODELS = [
  { id: "gpt-5.4-mini", label: "gpt-5.4-mini" },
  { id: "gpt-5.4", label: "gpt-5.4" },
];

const SUGGESTED_PROMPTS = [
  {
    icon: Sparkles,
    label: "Generate an invoice",
    prompt: "Generate a professional invoice for web design services worth $5,000",
  },
  {
    icon: Palette,
    label: "Change template & style",
    prompt: "Change the template to modern and make the theme color blue",
  },
  {
    icon: List,
    label: "Edit line items",
    prompt: "Add a new line item for consulting services at $150/hr, quantity 8",
  },
];

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string, model: string) => Promise<void>;
  onNewChat: () => void;
  isGenerating: boolean;
}

export default function ChatPanel({ messages, onSendMessage, onNewChat, isGenerating }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-5.4-mini");
  const [modelOpen, setModelOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  // Close model dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    if (modelOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [modelOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isGenerating) return;
    setInput("");
    await onSendMessage(text, model);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* New chat button */}
      <div className="flex justify-end px-3 pt-3 pb-1 shrink-0">
        <button
          onClick={onNewChat}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="New chat"
        >
          <SquarePen className="w-4 h-4" />
        </button>
      </div>

      {/* Messages / Empty state */}
      <ScrollArea className="flex-1 min-h-0">
        {isEmpty ? (
          <div className="px-5 pt-4 pb-4">
            <h2 className="text-xl font-bold text-foreground mb-5 leading-snug">
              What can I help<br />with today?
            </h2>
            <div className="flex flex-col gap-0.5">
              {SUGGESTED_PROMPTS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => onSendMessage(prompt, model)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left text-foreground/80 hover:bg-muted transition-colors"
                >
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-4 py-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "user" ? (
                  <div className="max-w-[80%] bg-muted text-foreground rounded-2xl rounded-br-sm px-3.5 py-2 text-sm leading-relaxed">
                    {msg.text}
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed text-foreground w-full chat-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    {isGenerating && i === messages.length - 1 && (
                      <span className="inline-block w-0.5 h-3.5 bg-foreground/50 ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing dots — only before first text arrives */}
            {isGenerating && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-1 items-center py-1 pl-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input card */}
      <div className="px-3 pb-3 pt-1 shrink-0">
        <div className="rounded-2xl border border-border bg-background shadow-sm px-3 pt-2.5 pb-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message the AI"
            rows={1}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed"
            style={{ minHeight: "20px", maxHeight: "120px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Toolbar row */}
          <div className="flex items-center gap-1.5 mt-2">
            <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Plus className="w-4 h-4" />
            </button>

            {/* Model selector */}
            <div className="relative" ref={modelMenuRef}>
              <button
                onClick={() => setModelOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {model}
                <ChevronDown className="w-3 h-3" />
              </button>
              {modelOpen && (
                <div className="absolute bottom-full left-0 mb-1.5 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setModel(m.id);
                        setModelOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-xs text-left hover:bg-muted transition-colors",
                        model === m.id ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send button */}
            <div className="ml-auto">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                  input.trim() && !isGenerating
                    ? "bg-foreground text-background hover:opacity-80"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
