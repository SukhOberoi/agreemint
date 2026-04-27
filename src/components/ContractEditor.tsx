"use client";
import React, { useState, useEffect, useCallback } from "react";
import ContractViewer from "./ContractViewer";
import ChatPanel from "./ChatPanel";
import { Button } from "@/components/ui/button";
import type { StructuredContract } from "@/lib/contractSchema";
import type {
  DocumentInvite,
  DocumentSignature,
} from "@/lib/documentTypes";
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
import { useSession } from "next-auth/react";

interface ContractEditorProps {
  contract: StructuredContract;
  documentId: string | null;
  invites?: DocumentInvite[];
  signatures?: DocumentSignature[];
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
  invites,
  signatures: initialSignatures,
}) => {
  const { data: session } = useSession();
  const [contract, setContract] = useState<StructuredContract>(initialContract);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [chatPrefill, setChatPrefill] = useState<string | null>(null);
  const [invitedParties, setInvitedParties] = useState<DocumentInvite[]>(
    invites ?? []
  );
  const [signatures, setSignatures] = useState<DocumentSignature[]>(
    initialSignatures ?? []
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState(session?.user?.name ?? "");
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const handlePlaceholderClick = (placeholder: string) => {
    const label = placeholder.replace(/^\[|\]$/g, "").replace(/_/g, " ").toLowerCase();
    setChatPrefill(`Replace ${placeholder} with: `);
    if (!showChat) setShowChat(true);
  };

  useEffect(() => {
    if (session?.user?.name) {
      setSignerName(session.user.name);
    }
  }, [session?.user?.name]);

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

  const signerEmail = session?.user?.email?.toLowerCase();
  const hasSigned = signatures.some(
    (signature) =>
      signature.signerId === session?.user?.id ||
      signature.signerEmail === signerEmail
  );

  const handleInviteSubmit = async () => {
    if (!documentId || !inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteError(null);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          email: inviteEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to invite party");
      }
      setInvitedParties(data.invites ?? []);
      setInviteEmail("");
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSign = async () => {
    if (!documentId || !signerName.trim()) return;
    setSigning(true);
    setSignError(null);
    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          signerName: signerName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to sign");
      }
      setSignatures((prev) => [...prev, data.signature]);
    } catch (err: any) {
      setSignError(err.message);
    } finally {
      setSigning(false);
    }
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Parties
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Parties</DialogTitle>
                <DialogDescription>
                  Add additional parties by email to view and sign this agreement.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Invitee email</Label>
                  <Input
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="name@example.com"
                    disabled={inviteLoading || !documentId}
                  />
                  <Button
                    type="button"
                    className="bg-bottlegreen hover:bg-bottlegreen/90"
                    onClick={handleInviteSubmit}
                    disabled={inviteLoading || !inviteEmail.trim() || !documentId}
                  >
                    {inviteLoading ? "Inviting..." : "Send Invite"}
                  </Button>
                  {inviteError && (
                    <p className="text-sm text-red-600">{inviteError}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">
                    Invited Parties
                  </h4>
                  {invitedParties.length === 0 ? (
                    <p className="text-sm text-gray-400">No invites yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm text-gray-700">
                      {invitedParties.map((invite) => (
                        <li key={invite.email} className="flex flex-col">
                          <span className="font-medium">{invite.email}</span>
                          <span className="text-xs text-gray-500">
                            Status: {invite.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">
                    Signatures
                  </h4>
                  {signatures.length === 0 ? (
                    <p className="text-sm text-gray-400">No signatures yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm text-gray-700">
                      {signatures.map((signature, index) => (
                        <li
                          key={`${signature.hash}-${index}`}
                          className="flex flex-col"
                        >
                          <span className="font-medium">
                            {signature.signerName ??
                              signature.signerEmail ??
                              "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Signed on{" "}
                            {new Date(signature.signedAt).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-bottlegreen hover:bg-bottlegreen/90"
                disabled={hasSigned || signing}
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
                {signError && <p className="text-sm text-red-600">{signError}</p>}
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
