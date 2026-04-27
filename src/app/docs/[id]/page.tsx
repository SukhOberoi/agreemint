import { db } from "@/lib/firebaseAdmin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DocumentView from "./DocumentView";
import type { DocumentInvite, DocumentSignature } from "@/lib/documentTypes";

interface Props {
  params: { id: string };
}

export default async function DocPage({ params }: Props) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/landing");
  }

  const { id } = await params;
  const docRef = db.collection("documents").doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return (
      <div className="flex h-[calc(100vh-72px)] items-center justify-center font-inter">
        <p className="text-gray-500">Document not found.</p>
      </div>
    );
  }

  const data = doc.data()!;
  const invites: DocumentInvite[] = Array.isArray(data.invitedParties)
    ? data.invitedParties
    : [];
  const signatures: DocumentSignature[] = Array.isArray(data.signatures)
    ? data.signatures
    : [];
  const email = session.user.email?.toLowerCase();
  const invite = email
    ? invites.find((entry) => entry.email === email)
    : undefined;
  const isOwner = data.userId === session.user.id;

  if (!isOwner && !invite) {
    return (
      <div className="flex h-[calc(100vh-72px)] items-center justify-center font-inter">
        <p className="text-gray-500">You do not have access to this document.</p>
      </div>
    );
  }

  return (
    <DocumentView
      documentId={id}
      rawContent={data.content}
      isOwner={isOwner}
      invites={invites}
      signatures={signatures}
      currentInvite={invite}
    />
  );
}
