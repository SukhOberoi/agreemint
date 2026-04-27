"use client";
import React, { useMemo, useState } from "react";
import ContractEditor from "@/components/ContractEditor";
import ReadOnlyDocumentView from "@/components/ReadOnlyDocumentView";
import { SessionProvider } from "next-auth/react";
import type { StructuredContract } from "@/lib/contractSchema";
import type {
  DocumentInvite,
  DocumentSignature,
} from "@/lib/documentTypes";

interface DocumentViewProps {
  documentId: string;
  rawContent: string;
  isOwner: boolean;
  invites: DocumentInvite[];
  signatures: DocumentSignature[];
  currentInvite?: DocumentInvite;
}

/**
 * Client wrapper that parses the stored JSON content and renders the
 * ContractEditor with the chat panel for amendments.
 */
export default function DocumentView({
  documentId,
  rawContent,
  isOwner,
  invites,
  signatures,
  currentInvite,
}: DocumentViewProps) {
  const [signatureState, setSignatureState] = useState<DocumentSignature[]>(
    signatures
  );
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

  const isLocked = signatureState.some(
    (signature) => signature?.hash && signature?.signedAt
  );
  const handleSignatureAdded = (signature: DocumentSignature) => {
    setSignatureState((prev) => {
      if (prev.some((entry) => entry.hash === signature.hash)) {
        return prev;
      }
      return [...prev, signature];
    });
  };

  return (
    <SessionProvider>
      {isOwner && !isLocked ? (
        <ContractEditor
          contract={contract}
          documentId={documentId}
          invites={invites}
          signatures={signatureState}
          onSignatureAdded={handleSignatureAdded}
        />
      ) : (
        <ReadOnlyDocumentView
          contract={contract}
          documentId={documentId}
          invite={currentInvite}
          signatures={signatureState}
          onSignatureAdded={handleSignatureAdded}
          isOwner={isOwner}
        />
      )}
    </SessionProvider>
  );
}
