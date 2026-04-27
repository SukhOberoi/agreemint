import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/firebaseAdmin";
import type { DocumentInvite } from "@/lib/documentTypes";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { documentId, email } = await req.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!documentId || !normalizedEmail) {
      return NextResponse.json(
        { success: false, error: "documentId and email are required" },
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
    if (data.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const currentInvites: DocumentInvite[] = Array.isArray(data.invitedParties)
      ? data.invitedParties
      : [];

    if (currentInvites.some((invite) => invite.email === normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Party already invited" },
        { status: 409 }
      );
    }

    const invite: DocumentInvite = {
      email: normalizedEmail,
      status: "pending",
      invitedAt: new Date().toISOString(),
      invitedBy: session.user.id,
    };

    const invitedEmails: string[] = Array.isArray(data.invitedEmails)
      ? data.invitedEmails
      : [];

    const updatedInvites = [...currentInvites, invite];
    const updatedEmails = Array.from(
      new Set([...invitedEmails, normalizedEmail])
    );

    await docRef.update({
      invitedParties: updatedInvites,
      invitedEmails: updatedEmails,
    });

    return NextResponse.json({ success: true, invites: updatedInvites });
  } catch (error: any) {
    console.error("POST /api/invites error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
