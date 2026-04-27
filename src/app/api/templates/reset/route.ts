import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/firebaseAdmin";
import defaultTemplates from "@/lib/templates";

/** POST — reset all user templates back to the built-in defaults */
export async function POST() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Delete all existing
    const snap = await db
      .collection("userTemplates")
      .doc(userId)
      .collection("templates")
      .get();

    const deleteBatch = db.batch();
    snap.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    // Re-seed defaults
    const seedBatch = db.batch();
    for (const tpl of defaultTemplates) {
      const ref = db
        .collection("userTemplates")
        .doc(userId)
        .collection("templates")
        .doc(tpl.type);
      seedBatch.set(ref, tpl);
    }
    await seedBatch.commit();

    return NextResponse.json({ success: true, templates: defaultTemplates });
  } catch (error: any) {
    console.error("POST /api/templates/reset error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
