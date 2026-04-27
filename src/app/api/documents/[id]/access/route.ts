import { db } from "@/lib/firebaseAdmin";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { publicAccess } = await req.json();

    if (!["involved", "anyone"].includes(publicAccess)) {
      return NextResponse.json({ error: "Invalid access type" }, { status: 400 });
    }

    const docRef = db.collection("documents").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const data = doc.data();
    if (data?.userId !== session.user.id) {
      return NextResponse.json({ error: "Only the owner can change access" }, { status: 403 });
    }

    await docRef.update({
      publicAccess,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, publicAccess });
  } catch (err: any) {
    console.error("Error updating access:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
