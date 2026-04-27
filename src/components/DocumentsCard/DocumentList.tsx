"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type DocResponse = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  inviteStatus?: string;
};

type Doc = DocResponse & {
  access: "owner" | "invited";
};

export default function DocumentList({ mini }: { mini: boolean }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const [ownedRes, invitedRes] = await Promise.all([
          fetch("/api/getUserDocuments", { method: "GET" }),
          fetch("/api/getInvitedDocuments", { method: "GET" }),
        ]);
        const ownedData = await ownedRes.json();
        const invitedData = await invitedRes.json();
        const ownedDocs = ownedData.success
          ? ownedData.documents.map((doc: DocResponse) => ({
              ...doc,
              access: "owner" as const,
            }))
          : [];
        const invitedDocs = invitedData.success
          ? invitedData.documents.map((doc: DocResponse) => ({
              ...doc,
              access: "invited" as const,
              inviteStatus: doc.inviteStatus,
            }))
          : [];
        setDocs([...ownedDocs, ...invitedDocs]);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const sortedDocs = [...docs].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  const displayDocs = mini ? sortedDocs.slice(0, 3) : sortedDocs;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-400">Loading documents...</p>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-400">No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 grid-cols-1">
      {displayDocs.map((doc) => (
        <Link key={doc.id} href={`/docs/${doc.id}`}>
          <div className="p-4 rounded-md bg-bgmint hover:bg-lightmint/30 transition-colors cursor-pointer">
            <h2 className="font-bold text-sm truncate">{doc.title || "Untitled"}</h2>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(doc.createdAt).toLocaleString()}
              {doc.updatedAt && ` · Updated: ${new Date(doc.updatedAt).toLocaleString()}`}
            </p>
            {doc.access === "invited" && (
              <p className="mt-1 text-xs text-bottlegreen">
                Shared with you · {doc.inviteStatus ?? "pending"}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
