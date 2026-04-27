"use client";
import React, { useEffect, useState } from "react";
import ContractViewer from "@/components/ContractViewer";
import { useSession } from "next-auth/react";
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

interface ReadOnlyDocumentViewProps {
  contract: StructuredContract;
  documentId: string;
  invite?: DocumentInvite;
  signatures: DocumentSignature[];
  onSignatureAdded: (signature: DocumentSignature) => void;
  isOwner: boolean;
  publicAccess: "involved" | "anyone";
}

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

const ReadOnlyDocumentView: React.FC<ReadOnlyDocumentViewProps> = ({
  contract,
  documentId,
  invite,
  signatures,
  onSignatureAdded,
  isOwner,
  publicAccess: initialPublicAccess,
}) => {
  const { data: session } = useSession();
  const [inviteStatus, setInviteStatus] = useState(
    invite?.status ?? "pending"
  );
  const [signerName, setSignerName] = useState(session?.user?.name ?? "");
  const [signing, setSigning] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicAccess, setPublicAccess] = useState(initialPublicAccess);
  const [updatingAccess, setUpdatingAccess] = useState(false);

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
  const canSignAsOwner = isOwner && !hasSigned;
  const canSignAsInvitee = !isOwner && inviteStatus === "accepted" && !hasSigned;
  const canSign = canSignAsOwner || canSignAsInvitee;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

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
      onSignatureAdded(data.signature);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  const handleUpdateAccess = async (newAccess: "involved" | "anyone") => {
    setUpdatingAccess(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicAccess: newAccess }),
      });
      if (res.ok) {
        setPublicAccess(newAccess);
      }
    } catch (err) {
      console.error("Error updating access:", err);
    } finally {
      setUpdatingAccess(false);
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col font-inter print:h-auto print:block">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 print:hidden">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">
            {isOwner ? "Agreement" : "Shared Agreement"}
          </h2>
          {!isOwner && (
            <p className="text-xs text-gray-500">
              Invite status: {inviteStatus}
            </p>
          )}
          {isOwner && (
            <p className="text-xs text-gray-500">Locked after signing.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {inviteStatus === "pending" && !isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? "Accepting..." : "Accept Invite"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            Print
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Document</DialogTitle>
                <DialogDescription>
                  Copy the link below to share this agreement.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input readOnly value={typeof window !== "undefined" ? window.location.href : ""} />
                  <Button onClick={copyLink} size="sm">Copy</Button>
                </div>
                {isOwner && (
                  <div className="space-y-2">
                    <Label>Access Control</Label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      value={publicAccess}
                      onChange={(e) => handleUpdateAccess(e.target.value as any)}
                      disabled={updatingAccess}
                    >
                      <option value="involved">Involved parties only</option>
                      <option value="anyone">Anyone with link</option>
                    </select>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

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
      <div className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
        <div className="mx-auto max-w-3xl">
          <ContractViewer contract={contract} />
          <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 print:border-none print:bg-transparent print:p-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-600">
              Signatures
            </h3>
            <div className="mt-3">
              <SignatureList signatures={signatures} />
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-600 print:hidden">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyDocumentView;
