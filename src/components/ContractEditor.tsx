"use client";
import React, { useState, useEffect, useCallback } from "react";
import ContractViewer from "./ContractViewer";
import ChatPanel from "./ChatPanel";
import { Button } from "@/components/ui/button";
import type { StructuredContract } from "@/lib/contractSchema";

interface ContractEditorProps {
  contract: StructuredContract;
  documentId: string | null;
}

/**
 * Two-panel editor view:
 *   Left  → Professional contract viewer
 *   Right → Chat panel for amendments
 *
 * Also handles auto-save when the contract changes.
 */
const ContractEditor: React.FC<ContractEditorProps> = ({
  contract: initialContract,
  documentId,
}) => {
  const [contract, setContract] = useState<StructuredContract>(initialContract);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [chatPrefill, setChatPrefill] = useState<string | null>(null);

  const handlePlaceholderClick = (placeholder: string) => {
    const label = placeholder.replace(/^\[|\]$/g, "").replace(/_/g, " ").toLowerCase();
    setChatPrefill(`Replace ${placeholder} with: `);
    if (!showChat) setShowChat(true);
  };

  // ── Auto-save on contract change (debounced) ──────────────
  const saveDocument = useCallback(async () => {
    if (!documentId) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/saveDoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          content: JSON.stringify(contract),
        }),
      });
      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Error saving document:", err);
    } finally {
      setIsSaving(false);
    }
  }, [contract, documentId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveDocument();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [contract, saveDocument]);

  const handleContractUpdate = (updated: StructuredContract) => {
    setContract(updated);
  };

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col font-inter">
      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="max-w-xs text-sm font-semibold text-gray-700 truncate">
            {contract.title}
          </h2>
          <span className="text-xs text-gray-400">
            {isSaving
              ? "Saving..."
              : lastSaved
                ? `Saved at ${lastSaved}`
                : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? "Hide Chat" : "Show Chat"}
          </Button>
          <Button
            size="sm"
            className="bg-bottlegreen hover:bg-bottlegreen/90"
            onClick={saveDocument}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* ── Main panels ────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Contract viewer */}
        <div
          className={`overflow-y-auto bg-white p-6 ${showChat ? "w-2/3 border-r border-gray-200" : "w-full"}`}
        >
          <ContractViewer contract={contract} onPlaceholderClick={handlePlaceholderClick} />
        </div>

        {/* Right: Chat panel */}
        {showChat && (
          <div className="w-1/3 bg-white">
            <ChatPanel
              contract={contract}
              documentId={documentId}
              onContractUpdate={handleContractUpdate}
              prefillText={chatPrefill}
              onPrefillConsumed={() => setChatPrefill(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractEditor;
