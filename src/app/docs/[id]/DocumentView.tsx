"use client";
import React, { useEffect, useMemo, useState } from "react";
import ContractEditor from "@/components/ContractEditor";
import ContractViewer from "@/components/ContractViewer";
import { SessionProvider, useSession } from "next-auth/react";
import type { StructuredContract } from "@/lib/contractSchema";
import type {
  DocumentInvite,
  DocumentSignature,
} from "@/lib/documentTypes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
function SignatureList({ signatures }: { signatures: DocumentSignature[] }) {
  if (!signatures.length) {
    return <p className="text-sm text-gray-400">No signatures yet.</p>;
  }

  return (
    <ul className="space-y-2 text-sm text-gray-700">
      {signatures.map((signature, index) => (
        <li key={`${signature.hash}-${index}`} className="flex flex-col">
          <span className="font-medium">
            {signature.signerName ?? signature.signerEmail ?? "Unknown"}
          </span>
          <span className="text-xs text-gray-500">
            Signed on {new Date(signature.signedAt).toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}

function InvitedDocumentView({
  contract,
  documentId,
  invite,
  initialSignatures,
}: {
  contract: StructuredContract;
  documentId: string;
  invite?: DocumentInvite;
  initialSignatures: DocumentSignature[];
}) {
  const { data: session } = useSession();
  const [inviteStatus, setInviteStatus] = useState(
    invite?.status ?? "pending"
  );
  const [signatures, setSignatures] = useState(initialSignatures);
  const [signerName, setSignerName] = useState(session?.user?.name ?? "");
  const [signing, setSigning] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.name) {
      setSignerName(session.user.name);
    }
  }, [session?.user?.name]);

  const signerEmail = session?.user?.email?.toLowerCase();
  const hasSigned = signatures.some(
    (signature) =>
      signature.signerId === session?.user?.id ||
      signature.signerEmail === signerEmail
  );
  const canSign = inviteStatus === "accepted" && !hasSigned;

  const handleAccept = async () => {
    if (!documentId) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch("/api/invites/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to accept invite");
      }
      setInviteStatus(data.invite?.status ?? "accepted");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleSign = async () => {
    if (!documentId || !signerName.trim()) return;
    setSigning(true);
    setError(null);
    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, signerName: signerName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to sign");
      }
      setSignatures((prev) => [...prev, data.signature]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col font-inter">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Shared Agreement</h2>
          <p className="text-xs text-gray-500">
            Invite status: {inviteStatus}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {inviteStatus === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? "Accepting..." : "Accept Invite"}
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-bottlegreen hover:bg-bottlegreen/90"
                disabled={!canSign || signing}
              >
                {hasSigned ? "Signed" : "Sign"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sign Agreement</DialogTitle>
                <DialogDescription>
                  Confirm your legal name to record a verifiable signature.
                </DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSign();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="signerName">Legal name</Label>
                  <Input
                    id="signerName"
                    value={signerName}
                    onChange={(event) => setSignerName(event.target.value)}
                    disabled={signing}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="bg-bottlegreen hover:bg-bottlegreen/90"
                  disabled={signing || !signerName.trim()}
                >
                  {signing ? "Signing..." : "Confirm Signature"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <ContractViewer contract={contract} />
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">
            Signatures
          </h3>
          <div className="mt-3">
            <SignatureList signatures={signatures} />
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default function DocumentView({
  documentId,
  rawContent,
  isOwner,
  invites,
  signatures,
  currentInvite,
}: DocumentViewProps) {
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
      {isOwner ? (
        <ContractEditor
          contract={contract}
          documentId={documentId}
          invites={invites}
          signatures={signatures}
        />
      ) : (
        <InvitedDocumentView
          contract={contract}
          documentId={documentId}
          invite={currentInvite}
          initialSignatures={signatures}
        />
      )}
    </SessionProvider>
  );
}
