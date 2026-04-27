import { db } from "@/lib/firebaseAdmin";
import { auth } from "@/auth";
import type { DocumentInvite } from "@/lib/documentTypes";

export async function GET() {
  const session = await auth();

  if (!session || !session.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();

  try {
    const documentsRef = db
      .collection("documents")
      .where("invitedEmails", "array-contains", email);
    const snapshot = await documentsRef.get();
    const documents = snapshot.docs.map((doc) => {
      const data = doc.data();
      const invites: DocumentInvite[] = Array.isArray(data.invitedParties)
        ? data.invitedParties
        : [];
      const invite = invites.find((entry) => entry.email === email);
      return {
        id: doc.id,
        ...data,
        inviteStatus: invite?.status ?? "pending",
      };
    });

    return Response.json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching invited documents: ", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
