import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import type { DocumentSignature } from "@/lib/documentTypes";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get("hash")?.trim();

  if (!hash) {
    return NextResponse.json(
      { success: false, error: "hash query param is required" },
      { status: 400 }
    );
  }

  try {
    const snapshot = await db
      .collection("documents")
      .where("signatureHashes", "array-contains", hash)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Signature not found" },
        { status: 404 }
      );
    }

    const matches = snapshot.docs.flatMap((doc) => {
      const data = doc.data() ?? {};
      const signatures: DocumentSignature[] = Array.isArray(data.signatures)
        ? data.signatures
        : [];
      return signatures
        .filter((signature) => signature.hash === hash)
        .map((signature) => ({
          documentId: doc.id,
          title: data.title ?? "Untitled",
          signedAt: signature.signedAt,
          signerName: signature.signerName ?? signature.signerEmail ?? "Unknown",
          signerEmail: signature.signerEmail,
          hash: signature.hash,
        }));
    });

    if (matches.length === 0) {
      return NextResponse.json(
        { success: false, error: "Signature not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, matches });
  } catch (error: any) {
    console.error("GET /api/verifySignature error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
