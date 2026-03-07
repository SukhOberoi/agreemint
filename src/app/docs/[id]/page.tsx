import { db } from "@/lib/firebaseAdmin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DocumentView from "./DocumentView";

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

  // Ensure this document belongs to the current user
  if (data.userId !== session.user.id) {
    return (
      <div className="flex h-[calc(100vh-72px)] items-center justify-center font-inter">
        <p className="text-gray-500">You do not have access to this document.</p>
      </div>
    );
  }

  return <DocumentView documentId={id} rawContent={data.content} />;
}
