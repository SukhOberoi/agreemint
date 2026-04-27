import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const TemplatesCard: React.FC = () => {
	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Templates</CardTitle>
				<CardDescription>
					View and customize your contract templates to match your business needs.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Link href="/templates">
					<Button className="w-full bg-voilet">
						<span className="material-symbols-outlined">
							description
						</span>{" "}
						Manage Templates
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
};

export default TemplatesCard;
