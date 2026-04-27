import { db } from "@/lib/firebaseAdmin";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { hasValidSignature } from "@/lib/signatureUtils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId, content } = await req.json();
  if (!documentId || !content) {
    return NextResponse.json(
      { error: "Document ID and content are required" },
      { status: 400 }
    );
  }

  try {
    const docRef = db.collection("documents").doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const data = doc.data();
    if (data?.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (hasValidSignature(data?.signatures)) {
      return NextResponse.json(
        { error: "Document is locked after signing" },
        { status: 409 }
      );
    }

    await docRef.update({
      content,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Document updated successfully" });
  } catch (error) {
    console.error("Error saving document:", error);
    return NextResponse.json(
      { error: "Failed to save document" },
      { status: 500 }
    );
  }
}
