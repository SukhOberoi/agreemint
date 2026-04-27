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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const VerifyCard: React.FC = () => {
	const router = useRouter();
	const [hash, setHash] = useState("");

	const handleVerify = () => {
		const trimmed = hash.trim();
		if (!trimmed) return;
		router.push(`/verify?hash=${encodeURIComponent(trimmed)}`);
	};

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Verify a Signature</CardTitle>
				<CardDescription>
					Paste a signature hash to validate an agreement instantly.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="space-y-2">
					<Label htmlFor="dashboard-hash">Hash value</Label>
					<Input
						id="dashboard-hash"
						value={hash}
						onChange={(event) => setHash(event.target.value)}
						placeholder="Paste hash value"
					/>
				</div>
				<Button
					className="w-full bg-bottlegreen"
					onClick={handleVerify}
					disabled={!hash.trim()}
				>
					Verify now
				</Button>
			</CardContent>
			<CardFooter>
				<Link className="text-xs text-bottlegreen underline" href="/verify">
					Go to verification page
				</Link>
			</CardFooter>
		</Card>
	);
};

export default VerifyCard;
