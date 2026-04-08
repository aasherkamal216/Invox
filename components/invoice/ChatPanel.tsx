"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { List, Palette, Sparkles, ChevronDown, ArrowUp, SquarePen, Plus, FileText, X, Mic, Square, Loader2 } from "lucide-react";

type RecordingState = "idle" | "recording" | "transcribing";

type AttachedFile = {
  file: File;
  name: string;
  mimeType: string;
  preview?: string; // data URL for images
};

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

type EncodedFile = { name: string; mimeType: string; base64: string };

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (
    prompt: string,
    model: string,
    files?: EncodedFile[],
    attachments?: { name: string; mimeType: string; preview?: string }[]
  ) => Promise<void>;
  onNewChat: () => void;
  isGenerating: boolean;
}

export default function ChatPanel({ messages, onSendMessage, onNewChat, isGenerating }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-5.4-mini");
  const [modelOpen, setModelOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_RECORDING_SECONDS = 30;

  const isEmpty = messages.length === 0;

  const clearRecordingTimers = useCallback(() => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    recordingTimerRef.current = null;
    recordingTimeoutRef.current = null;
  }, []);

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

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      clearRecordingTimers();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [clearRecordingTimers]);

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

  const transcribeAudio = useCallback(async (blob: Blob) => {
    setRecordingState("transcribing");
    try {
      const formData = new FormData();
      const mimeType = blob.type || "audio/webm";
      const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
      formData.append("audio", blob, `recording.${ext}`);

      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Transcription failed");
      const data = await res.json() as { text?: string };

      if (data.text?.trim()) {
        setInput((prev) => {
          const combined = prev ? `${prev} ${data.text!.trim()}` : data.text!.trim();
          return combined.slice(0, 1000);
        });
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    } catch {
      // silently fall through — user can retry
    } finally {
      setRecordingState("idle");
      setRecordingSeconds(0);
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearRecordingTimers();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, [clearRecordingTimers]);

  const startRecording = useCallback(async () => {
    if (recordingState !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
        .find((t) => MediaRecorder.isTypeSupported(t)) ?? "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const finalMime = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        transcribeAudio(blob);
      };

      recorder.start(100);
      setRecordingState("recording");
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);

      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_SECONDS * 1000);
    } catch {
      // microphone denied — silently ignore
    }
  }, [recordingState, transcribeAudio, stopRecording]);

  const handleMicClick = useCallback(() => {
    if (recordingState === "idle") startRecording();
    else if (recordingState === "recording") stopRecording();
  }, [recordingState, startRecording, stopRecording]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const allowed = selected.filter((f) =>
      ["image/png", "image/jpeg", "application/pdf"].includes(f.type)
    );
    const remaining = 2 - attachedFiles.length;
    const toAdd = allowed.slice(0, remaining);

    toAdd.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setAttachedFiles((prev) =>
            prev.length < 2 ? [...prev, { file, name: file.name, mimeType: file.type, preview: ev.target?.result as string }] : prev
          );
        };
        reader.readAsDataURL(file);
      } else {
        setAttachedFiles((prev) =>
          prev.length < 2 ? [...prev, { file, name: file.name, mimeType: file.type }] : prev
        );
      }
    });

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && attachedFiles.length === 0) || isGenerating || recordingState !== "idle") return;

    // Encode attached files as base64
    const encodedFiles: EncodedFile[] = await Promise.all(
      attachedFiles.map(
        ({ file, name, mimeType }) =>
          new Promise<EncodedFile>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target?.result as string;
              resolve({ name, mimeType, base64: dataUrl.split(",")[1] });
            };
            reader.readAsDataURL(file);
          })
      )
    );

    const attachmentMeta = attachedFiles.map(({ name, mimeType, preview }) => ({ name, mimeType, preview }));

    setInput("");
    setAttachedFiles([]);
    await onSendMessage(
      text || "Please analyze the attached file(s).",
      model,
      encodedFiles.length > 0 ? encodedFiles : undefined,
      attachmentMeta.length > 0 ? attachmentMeta : undefined
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

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
              How can I help you today?
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
                  <div className="max-w-[80%] flex flex-col gap-1.5 items-end">
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex gap-2 flex-wrap justify-end">
                        {msg.attachments.map((a, ai) =>
                          a.preview ? (
                            <img
                              key={ai}
                              src={a.preview}
                              alt={a.name}
                              className="h-24 w-auto max-w-[160px] rounded-xl object-cover border border-border"
                            />
                          ) : (
                            <div key={ai} className="flex items-center gap-1.5 bg-muted rounded-xl px-2.5 py-1.5 text-xs text-foreground/80">
                              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="max-w-[120px] truncate">{a.name}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {msg.text && (
                      <div className="bg-muted text-foreground rounded-2xl rounded-br-sm px-3.5 py-2 text-sm leading-relaxed">
                        {msg.text}
                      </div>
                    )}
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
        <div
          className={cn(
            "rounded-2xl border bg-background shadow-sm px-3 pt-2.5 pb-2 transition-colors duration-200",
            recordingState === "recording" ? "border-red-400/60" : "border-border"
          )}
        >
          {/* File chips */}
          {attachedFiles.length > 0 && recordingState === "idle" && (
            <div className="flex gap-2 flex-wrap mb-2.5">
              {attachedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1 text-xs max-w-[160px]">
                  {f.preview ? (
                    <img src={f.preview} className="w-5 h-5 object-cover rounded shrink-0" alt="" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate text-foreground/80">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground shrink-0 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recording / Transcribing indicator */}
          {recordingState === "recording" && (
            <div className="flex items-center gap-2.5 py-0.5 mb-1">
              {/* Animated waveform bars */}
              <div className="flex items-center gap-[3px] h-5">
                <div className="w-[3px] rounded-full bg-red-500 origin-bottom" style={{ height: "18px", animation: "soundbar 0.8s ease-in-out infinite alternate" }} />
                <div className="w-[3px] rounded-full bg-red-500 origin-bottom" style={{ height: "18px", animation: "soundbar 0.8s ease-in-out 0.12s infinite alternate" }} />
                <div className="w-[3px] rounded-full bg-red-500 origin-bottom" style={{ height: "18px", animation: "soundbar 0.8s ease-in-out 0.24s infinite alternate" }} />
                <div className="w-[3px] rounded-full bg-red-500 origin-bottom" style={{ height: "18px", animation: "soundbar 0.8s ease-in-out 0.36s infinite alternate" }} />
                <div className="w-[3px] rounded-full bg-red-500 origin-bottom" style={{ height: "18px", animation: "soundbar 0.8s ease-in-out 0.08s infinite alternate" }} />
              </div>
              <span className="text-xs text-red-500 font-medium tabular-nums">
                {String(Math.floor(recordingSeconds / 60)).padStart(1, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
                <span className="text-red-400/60 font-normal"> / 0:30</span>
              </span>
              {/* Progress bar */}
              <div className="flex-1 h-[3px] rounded-full bg-red-100 overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(recordingSeconds / MAX_RECORDING_SECONDS) * 100}%` }}
                />
              </div>
            </div>
          )}

          {recordingState === "transcribing" && (
            <div className="flex items-center gap-2 py-0.5 mb-1">
              <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground">Transcribing...</span>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 1000))}
            placeholder={recordingState === "recording" ? "Listening…" : "Message the AI"}
            readOnly={recordingState !== "idle"}
            rows={1}
            className={cn(
              "w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none leading-relaxed transition-opacity",
              recordingState !== "idle" && "opacity-40 cursor-default"
            )}
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
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={attachedFiles.length >= 2 || recordingState !== "idle"}
              className={cn(
                "p-1 rounded-md transition-colors",
                attachedFiles.length >= 2 || recordingState !== "idle"
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={attachedFiles.length >= 2 ? "Max 2 files" : "Attach file (PNG, JPG, PDF)"}
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Model selector */}
            <div className="relative" ref={modelMenuRef}>
              <button
                onClick={() => setModelOpen((v) => !v)}
                disabled={recordingState !== "idle"}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors",
                  recordingState !== "idle"
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-foreground hover:bg-muted"
                )}
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
                      className="w-full px-3 py-2 text-xs text-foreground text-left hover:bg-muted transition-colors"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mic + Send buttons */}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={handleMicClick}
                disabled={recordingState === "transcribing"}
                title={recordingState === "recording" ? "Stop recording" : "Dictate message (max 30s)"}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  recordingState === "recording"
                    ? "text-red-500 hover:bg-red-50"
                    : recordingState === "transcribing"
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {recordingState === "recording" ? (
                  <Square className="w-4 h-4 fill-current" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating || recordingState !== "idle"}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                  input.trim() && !isGenerating && recordingState === "idle"
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
