"use client";
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DocumentList from "./DocumentList";
import Link from "next/link";

interface DocumentsCardProps {
	mini?: boolean;
}

const DocumentsCard: React.FC<DocumentsCardProps> = ({ mini }) => {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Documents</CardTitle>
				<CardDescription>
					View and manage your existing legal agreements.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<DocumentList mini={mini ?? true} />
			</CardContent>
			{mini && (
				<CardFooter className="flex justify-end">
					<Link href={"/docs"}>
						<Button variant="link">See more</Button>
					</Link>
				</CardFooter>
			)}
		</Card>
	);
};

export default DocumentsCard;
