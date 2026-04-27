import type { DocumentSignature } from "@/lib/documentTypes";

export const hasValidSignature = (
  signatures?: DocumentSignature[] | null
): boolean =>
  Array.isArray(signatures) &&
  signatures.some((signature) => signature?.hash && signature?.signedAt);
