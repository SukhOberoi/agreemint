import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/firebaseAdmin";
import defaultTemplates from "@/lib/templates";
import type { ContractTemplate } from "@/lib/templates";

/**
 * Ensure the user has a templates collection.
 * If not, seed it with the default templates.
 * Returns the user's templates array.
 */
async function ensureUserTemplates(userId: string): Promise<ContractTemplate[]> {
  const snap = await db
    .collection("userTemplates")
    .doc(userId)
    .collection("templates")
    .get();

  if (!snap.empty) {
    return snap.docs.map((d) => d.data() as ContractTemplate);
  }

  // Seed defaults
  const batch = db.batch();
  for (const tpl of defaultTemplates) {
    const ref = db
      .collection("userTemplates")
      .doc(userId)
      .collection("templates")
      .doc(tpl.type);
    batch.set(ref, tpl);
  }
  await batch.commit();

  return [...defaultTemplates];
}

/** GET — list all templates for the authenticated user */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const templates = await ensureUserTemplates(session.user.id);
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error("GET /api/templates error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/** POST — create a brand-new template */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const template: ContractTemplate = await req.json();
    if (!template.type || !template.displayName) {
      return NextResponse.json(
        { success: false, error: "type and displayName are required" },
        { status: 400 }
      );
    }

    // Ensure seed has happened
    await ensureUserTemplates(session.user.id);

    const ref = db
      .collection("userTemplates")
      .doc(session.user.id)
      .collection("templates")
      .doc(template.type);

    const existing = await ref.get();
    if (existing.exists) {
      return NextResponse.json(
        { success: false, error: "Template with this type already exists" },
        { status: 409 }
      );
    }

    await ref.set(template);
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("POST /api/templates error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/** PUT — update an existing template */
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const template: ContractTemplate = await req.json();
    if (!template.type) {
      return NextResponse.json(
        { success: false, error: "type is required" },
        { status: 400 }
      );
    }

    const ref = db
      .collection("userTemplates")
      .doc(session.user.id)
      .collection("templates")
      .doc(template.type);

    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    await ref.set(template);
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error("PUT /api/templates error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/** DELETE — remove a template by type (query param ?type=xyz) */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    if (!type) {
      return NextResponse.json(
        { success: false, error: "type query param is required" },
        { status: 400 }
      );
    }

    const ref = db
      .collection("userTemplates")
      .doc(session.user.id)
      .collection("templates")
      .doc(type);

    const existing = await ref.get();
    if (!existing.exists) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/templates error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates/reset — reset user templates to defaults.
 * (Handled via a query param since Next.js doesn't support multiple POST
 *  handlers; alternatively create a sub-route.)
 */
