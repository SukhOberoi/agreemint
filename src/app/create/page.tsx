"use client";
import React, { useState } from "react";
import UploadCard from "@/components/UploadCard";
import ContractEditor from "@/components/ContractEditor";
import { SessionProvider } from "next-auth/react";
import type { StructuredContract } from "@/lib/contractSchema";

const Create: React.FC = () => {
	const [contract, setContract] = useState<StructuredContract | null>(null);
	const [documentId, setDocumentId] = useState<string | null>(null);

	return (
		<SessionProvider>
			{!contract && (
				<div className="flex items-center justify-center w-full h-[calc(100vh-72px)] p-4 font-inter">
					<UploadCard setContract={setContract} setDocumentId={setDocumentId} />
				</div>
			)}
			{contract && (
				<ContractEditor contract={contract} documentId={documentId} />
			)}
		</SessionProvider>
	);
};

export default Create;
