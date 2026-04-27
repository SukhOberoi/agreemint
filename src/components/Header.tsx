import React from "react";
import "material-symbols/outlined.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

const Header: React.FC = async () => {
	const session = await auth();
	const user = session?.user;
		return (
			<div className="flex items-center justify-between px-6 py-4 print-hidden">
			<Link href="/">
				<div className="flex items-center text-3xl font-bold" id="left">
					<span className="!text-4xl material-symbols-outlined">
						eco
					</span>
					Agreemint
				</div>
			</Link>
			<div id="right">
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Avatar>
								<AvatarImage src={user.image} />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="mr-2">
							<DropdownMenuLabel>{user.name}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Profile</DropdownMenuItem>
							<DropdownMenuItem>Settings</DropdownMenuItem>
							<form
								action={async () => {
									"use server";
									await signOut({ redirectTo: "/landing" });
								}}
								className="w-full"
							>
								<button type="submit" className="w-full">
									<DropdownMenuItem>
										Sign Out
									</DropdownMenuItem>
								</button>
							</form>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<form
						action={async () => {
							"use server";
							await signIn("google", { redirectTo: "/" });
						}}
					>
						<Button type="submit">Sign in</Button>
					</form>
				)}
			</div>
		</div>
	);
};

export default Header;
