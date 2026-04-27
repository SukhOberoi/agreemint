"use client";
import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoonLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import type { StructuredContract } from "@/lib/contractSchema";

const UploadCard = ({
    setContract,
    setDocumentId,
}: {
    setContract: (c: StructuredContract) => void;
    setDocumentId: (id: string) => void;
}) => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [audioBase64, setAudioBase64] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [mimeType, setMimeType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companyDetails, setCompanyDetails] = useState({
        companyName: "",
        companyCity: "",
        companyCountry: "",
        position: "",
    });

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            if (!userId) return;
            try {
                const response = await fetch("/api/onboarding", { method: "GET" });
                const data = await response.json();
                if (data.success) {
                    setCompanyDetails({
                        companyName: data.companyName,
                        companyCity: data.companyCity,
                        companyCountry: data.companyCountry,
                        position: data.position,
                    });
                } else {
                    setError(data.error);
                }
            } catch (err) {
                console.error("Error fetching company details:", err);
                setError("Failed to fetch company details.");
            }
        };
        fetchCompanyDetails();
    }, [userId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMimeType(file.type);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAudioBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!audioBase64 && !description) {
            setError("Either a file or a description must be provided.");
            return;
        }
        setLoading(true);
        try {
            // 1. Generate structured contract via Gemini
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audioBase64,
                    mimeType,
                    description,
                    companyDetails,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error ?? "Failed to generate document");
            }

            const data = await response.json();
            const contract: StructuredContract = data.contract;

            // 2. Create the document in Firestore
            const documentResponse = await fetch("/api/createDoc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    content: JSON.stringify(contract),
                    title: contract.title,
                }),
            });

            if (!documentResponse.ok) {
                throw new Error("Failed to upload document");
            }

            const documentData = await documentResponse.json();
            setDocumentId(documentData.id);
            setContract(contract);
        } catch (error: any) {
            console.error("Error uploading file:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Create Document</CardTitle>
                <CardDescription>
                    Generate a new agreement by uploading a voice recording and/or giving a description.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="audio">Upload a Call Recording</Label>
                        <Input type="file" name="audio" accept="audio/*" onChange={handleFileChange} />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            type="text"
                            name="description"
                            placeholder="Describe the agreement terms..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input type="text" name="companyName" value={companyDetails.companyName} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                            <Label htmlFor="position">Position</Label>
                            <Input type="text" name="position" value={companyDetails.position} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                            <Label htmlFor="companyCity">City</Label>
                            <Input type="text" name="companyCity" value={companyDetails.companyCity} readOnly className="bg-gray-50" />
                        </div>
                        <div>
                            <Label htmlFor="companyCountry">Country</Label>
                            <Input type="text" name="companyCountry" value={companyDetails.companyCountry} readOnly className="bg-gray-50" />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button className="w-full bg-bottlegreen hover:bg-bottlegreen/90" type="submit" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <MoonLoader size={15} color="white" />
                                Generating contract...
                            </span>
                        ) : (
                            "Generate"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default UploadCard;
