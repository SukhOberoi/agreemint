"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Doc = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
};

export default function DocumentList({ mini }: { mini: boolean }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/getUserDocuments", { method: "GET" });
        const data = await res.json();
        if (data.success) {
          setDocs(data.documents);
        }
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
          </div>
        </Link>
      ))}
    </div>
  );
}
