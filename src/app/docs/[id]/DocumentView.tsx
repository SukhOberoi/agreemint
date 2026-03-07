"use client";
import React, { useMemo } from "react";
import ContractEditor from "@/components/ContractEditor";
import { SessionProvider } from "next-auth/react";
import type { StructuredContract } from "@/lib/contractSchema";

interface DocumentViewProps {
  documentId: string;
  rawContent: string;
}

/**
 * Client wrapper that parses the stored JSON content and renders the
 * ContractEditor with the chat panel for amendments.
 */
export default function DocumentView({ documentId, rawContent }: DocumentViewProps) {
  const contract = useMemo<StructuredContract | null>(() => {
    try {
      return JSON.parse(rawContent);
    } catch {
      return null;
    }
  }, [rawContent]);

  if (!contract) {
    return (
      <div className="flex h-[calc(100vh-72px)] items-center justify-center font-inter">
        <p className="text-gray-500">
          This document was created with an older format and cannot be displayed in the new viewer.
        </p>
      </div>
    );
  }

  return (
    <SessionProvider>
      <ContractEditor contract={contract} documentId={documentId} />
    </SessionProvider>
  );
}
