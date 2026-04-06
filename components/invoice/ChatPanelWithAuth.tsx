"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import ChatPanel from "./ChatPanel";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/lib/types";

type EncodedFile = { name: string; mimeType: string; base64: string };

interface Props {
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

export default function ChatPanelWithAuth(props: Props) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Sign in to use AI</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
            Create a free account to generate and edit invoices with AI
          </p>
        </div>
        <SignInButton mode="modal" forceRedirectUrl="/editor">
          <Button size="sm">Sign in</Button>
        </SignInButton>
      </div>
    );
  }

  return <ChatPanel {...props} />;
}
