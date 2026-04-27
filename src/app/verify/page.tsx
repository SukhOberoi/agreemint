"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const Verify: React.FC = () => {
    const [hash, setHash] = useState("");
    const [matches, setMatches] = useState<
        { documentId: string; title: string; signerName: string; signedAt: string; hash: string }[]
    >([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const searchParams = useSearchParams();

    const verifyHash = useCallback(async (value: string) => {
        if (!value.trim()) return;
        setLoading(true);
        setError(null);
        setMatches([]);
        setHasChecked(true);
        try {
            const res = await fetch(`/api/verifySignature?hash=${encodeURIComponent(value.trim())}`);
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
    }, []);

    useEffect(() => {
        const preset = searchParams.get("hash");
        if (preset && preset !== hash) {
            setHash(preset);
            verifyHash(preset);
        }
    }, [hash, searchParams, verifyHash]);

    const handleSubmit = async () => {
        await verifyHash(hash);
    };

    return (
        <div className="flex min-h-[calc(100vh-50px)] items-center justify-center px-4 py-10">
            <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
                <Card className="font-inter">
                    <CardHeader>
                        <CardTitle>Verify a Document Signature</CardTitle>
                        <CardDescription>
                            Enter the signature hash to confirm authenticity and review the agreement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="hash">Hash value</Label>
                            <Input
                                name="hash"
                                type="text"
                                value={hash}
                                onChange={(e) => {
                                    setHash(e.target.value);
                                }}
                                placeholder="Paste signature hash"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button onClick={handleSubmit} disabled={loading || !hash.trim()}>
                                {loading ? "Checking..." : "Verify signature"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setHash("");
                                    setMatches([]);
                                    setError(null);
                                    setHasChecked(false);
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </CardContent>
                </Card>
                <Card className="font-inter">
                    <CardHeader>
                        <CardTitle>Verification results</CardTitle>
                        <CardDescription>
                            Matches will appear here once a hash is verified.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {matches.length > 0 ? (
                            <div className="space-y-3 text-sm text-gray-700">
                                {matches.map((match) => (
                                    <div
                                        key={`${match.documentId}-${match.hash}`}
                                        className="rounded-md border border-gray-200 p-3"
                                    >
                                        <p className="font-semibold">{match.title}</p>
                                        <p>Signed by {match.signerName}</p>
                                        <p>Signed on {new Date(match.signedAt).toLocaleString()}</p>
                                        <Link className="text-bottlegreen underline" href={`/docs/${match.documentId}`}>
                                            View document
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                {hasChecked
                                    ? "No matches found for that hash."
                                    : "Paste a hash value to start verification."}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Verify;
