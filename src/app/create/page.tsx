"use client";
import React, { useState } from "react";
import UploadCard from "@/components/UploadCard";
import ContractEditor from "@/components/ContractEditor";
import { SessionProvider } from "next-auth/react";
import type { StructuredContract } from "@/lib/contractSchema";
import type { DocumentSignature } from "@/lib/documentTypes";

const Create: React.FC = () => {
	const [contract, setContract] = useState<StructuredContract | null>(null);
	const [documentId, setDocumentId] = useState<string | null>(null);
	const [signatures, setSignatures] = useState<DocumentSignature[]>([]);

	return (
		<SessionProvider>
			{!contract && (
				<div className="flex items-center justify-center w-full h-[calc(100vh-72px)] p-4 font-inter">
					<UploadCard setContract={setContract} setDocumentId={setDocumentId} />
				</div>
			)}
			{contract && (
				<ContractEditor
					contract={contract}
					documentId={documentId}
					signatures={signatures}
					onSignatureAdded={(signature) =>
						setSignatures((prev) => [...prev, signature])
					}
					publicAccess="involved"
				/>
			)}
		</SessionProvider>
	);
};

export default Create;
