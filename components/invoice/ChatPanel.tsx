"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export default function ChatPanel({ messages, onSendMessage, isGenerating }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isGenerating) return;
    setInput("");
    await onSendMessage(text);
  };

  return (
    <div className="flex flex-col h-full w-[300px] border-r border-border bg-sidebar shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">AI Assistant</p>
            <p className="text-xs text-muted-foreground">Powered by OpenAI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 9h6M9 12h6M9 15h4" />
                  </svg>
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-accent text-foreground rounded-tl-sm",
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0 mt-0.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 9h6M9 12h6M9 15h4" /></svg>
              </div>
              <div className="bg-accent rounded-xl rounded-tl-sm px-3 py-2 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border flex flex-col gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to create or edit invoice..."
          className="text-xs resize-none min-h-[72px] max-h-32"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          size="sm"
          className="w-full"
          onClick={handleSend}
          disabled={!input.trim() || isGenerating}
          loading={isGenerating}
        >
          {!isGenerating && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
