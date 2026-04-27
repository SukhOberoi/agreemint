"use client";
import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Verify: React.FC = () => {
    const [hash, setHash] = useState("");
    const [matches, setMatches] = useState<
        { documentId: string; title: string; signerName: string; signedAt: string; hash: string }[]
    >([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!hash.trim()) return;
        setLoading(true);
        setError(null);
        setMatches([]);
        try {
            const res = await fetch(`/api/verifySignature?hash=${encodeURIComponent(hash.trim())}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error ?? "Signature not found");
            }
            setMatches(data.matches ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center h-[calc(100vh-50px)] items-center">
            <Card className="font-inter">
                <CardHeader>
                    <CardTitle>Verify Signature</CardTitle>
                    <CardDescription>
                        Verify a signature made on Agreemint with the hash value.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="hash">Hash Value</Label>
                    <Input
                        name="hash"
                        type="text"
                        value={hash}
                        onChange={(e) => {
                            setHash(e.target.value);
                        }}
                    />
                    <br />
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Checking..." : "Check"}
                    </Button>
                    <br />
                    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                    {matches.length > 0 && (
                        <div className="mt-4 space-y-3 text-sm text-gray-700">
                            {matches.map((match) => (
                                <div key={`${match.documentId}-${match.hash}`} className="rounded-md border border-gray-200 p-3">
                                    <p className="font-semibold">{match.title}</p>
                                    <p>Signed by {match.signerName}</p>
                                    <p>Signed on {new Date(match.signedAt).toLocaleString()}</p>
                                    <Link className="text-bottlegreen underline" href={`/docs/${match.documentId}`}>
                                        View document
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Verify;
