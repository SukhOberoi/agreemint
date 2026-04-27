"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StructuredContract } from "@/lib/contractSchema";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface ChatPanelProps {
  contract: StructuredContract;
  documentId: string | null;
  onContractUpdate: (updated: StructuredContract) => void;
  prefillText?: string | null;
  onPrefillConsumed?: () => void;
}

/**
 * A conversational panel that lets the user request amendments
 * to the current contract via natural language.
 */
const ChatPanel: React.FC<ChatPanelProps> = ({
  contract,
  documentId,
  onContractUpdate,
  prefillText,
  onPrefillConsumed,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prefill the input when a placeholder is clicked
  useEffect(() => {
    if (prefillText) {
      setInput(prefillText);
      onPrefillConsumed?.();
      // Focus the input and place cursor at the end
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [prefillText, onPrefillConsumed]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          contract,
          conversationHistory: messages, // prior turns (not including this one — we send it as userMessage)
          userMessage: trimmed,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to get amendment");
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        role: "model",
        text: "Contract updated. Review the changes on the left.",
      };

      // If the model returned notes, show them in the chat
      if (data.contract?.notes?.length) {
        modelMsg.text += "\n\nNotes:\n" + data.contract.notes.join("\n");
      }

      setMessages([...updatedMessages, modelMsg]);
      onContractUpdate(data.contract);
    } catch (error: any) {
      const errMsg: ChatMessage = {
        role: "model",
        text: `Error: ${error.message}`,
      };
      setMessages([...updatedMessages, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col font-inter">
      {/* ── Header ────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Amendment Chat
        </h3>
        <p className="text-xs text-gray-500">
          Ask me to change clauses, add sections, or adjust terms.
        </p>
      </div>

      {/* ── Messages ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-gray-400">
              No messages yet. Describe any changes you&apos;d like to make to
              the contract.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-bottlegreen text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span className="animate-pulse">Thinking</span>
                <span className="animate-bounce">...</span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ─────────────────────────────────────── */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            className="flex-1"
            placeholder="e.g. Change the payment terms to net-60..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button
            className="bg-bottlegreen hover:bg-bottlegreen/90"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
