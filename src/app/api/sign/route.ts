import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/firebaseAdmin";
import { createHash } from "crypto";
import type { DocumentInvite, DocumentSignature } from "@/lib/documentTypes";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { documentId, signerName } = await req.json();
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "documentId is required" },
        { status: 400 }
      );
    }

    const docRef = db.collection("documents").doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const data = doc.data() ?? {};
    const userId = session.user.id;
    const email = session.user.email.toLowerCase();
    const invites: DocumentInvite[] = Array.isArray(data.invitedParties)
      ? data.invitedParties
      : [];
    const invite = invites.find((entry) => entry.email === email);
    const isOwner = data.userId === userId;

    if (!isOwner && invite?.status !== "accepted") {
      return NextResponse.json(
        { success: false, error: "Not authorized to sign" },
        { status: 403 }
      );
    }

    const existingSignatures: DocumentSignature[] = Array.isArray(data.signatures)
      ? data.signatures
      : [];
    if (
      existingSignatures.some(
        (signature) => signature.signerId === userId || signature.signerEmail === email
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Signature already recorded" },
        { status: 409 }
      );
    }

    const content = typeof data.content === "string" ? data.content : "";
    const hash = createHash("sha256")
      .update(`${documentId}:${content}`)
      .digest("hex");

    const signature: DocumentSignature = {
      hash,
      signedAt: new Date().toISOString(),
      signerId: userId,
      signerEmail: email,
      signerName: signerName || session.user.name || session.user.email,
    };

    const signatureHashes: string[] = Array.isArray(data.signatureHashes)
      ? data.signatureHashes
      : [];

    await docRef.update({
      signatures: [...existingSignatures, signature],
      signatureHashes: Array.from(new Set([...signatureHashes, hash])),
    });

    return NextResponse.json({ success: true, signature });
  } catch (error: any) {
    console.error("POST /api/sign error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
