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

const Verify: React.FC = () => {
    const [hash, setHash] = useState("");
    const [result, setResult] = useState("");

    const handleSubmit = () => {
        if (hash === "44090f6ae6c2e9d57d29c677165a9482cb6ed21e25065c263a4ae677979e26db") {
            setResult("Employment Contract<br />Signed by Amit on 25th October 2024<br />Signature verified by Agreemint");
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
                    <Button onClick={handleSubmit}>Check</Button>
                    <br />
                    <div className="text-wrap" dangerouslySetInnerHTML={{ __html: result }} />
                </CardContent>
            </Card>
        </div>
    );
};

export default Verify;
