import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/firebaseAdmin";
import type { DocumentInvite } from "@/lib/documentTypes";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { documentId } = await req.json();
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
    const email = session.user.email.toLowerCase();
    const currentInvites: DocumentInvite[] = Array.isArray(data.invitedParties)
      ? data.invitedParties
      : [];

    const inviteIndex = currentInvites.findIndex(
      (invite) => invite.email === email
    );

    if (inviteIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Invite not found" },
        { status: 404 }
      );
    }

    const invite = currentInvites[inviteIndex];
    if (invite.status === "accepted") {
      return NextResponse.json({ success: true, invite });
    }

    const updatedInvite: DocumentInvite = {
      ...invite,
      status: "accepted",
      acceptedAt: new Date().toISOString(),
      userId: session.user.id,
      name: session.user.name ?? invite.name,
    };

    const updatedInvites = [...currentInvites];
    updatedInvites[inviteIndex] = updatedInvite;

    await docRef.update({ invitedParties: updatedInvites });

    return NextResponse.json({ success: true, invite: updatedInvite });
  } catch (error: any) {
    console.error("POST /api/invites/approve error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
