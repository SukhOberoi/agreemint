export type InviteStatus = "pending" | "accepted" | "revoked";

export interface DocumentInvite {
  email: string;
  status: InviteStatus;
  invitedAt: string;
  invitedBy: string;
  acceptedAt?: string;
  userId?: string;
  name?: string;
}

export interface DocumentSignature {
  hash: string;
  signedAt: string;
  signerId?: string;
  signerEmail?: string;
  signerName?: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  invitedParties?: DocumentInvite[];
  invitedEmails?: string[];
  signatures?: DocumentSignature[];
  signatureHashes?: string[];
}
