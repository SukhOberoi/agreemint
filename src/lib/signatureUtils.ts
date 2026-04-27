import type { DocumentSignature } from "@/lib/documentTypes";

export const hasValidSignature = (
  signatures?: DocumentSignature[] | null
): boolean =>
  Array.isArray(signatures) &&
  signatures.some(
    (signature) =>
      typeof signature?.hash === "string" &&
      signature.hash.trim().length > 0 &&
      typeof signature?.signedAt === "string" &&
      signature.signedAt.trim().length > 0
  );
