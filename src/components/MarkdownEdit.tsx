"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import MDEditor from "@uiw/react-md-editor";
import crypto from "crypto"; // to generate the hash

const MarkdownEdit = ({ document, documentId, setDocument, isOtherParty = false }) => {
  const [content, setContent] = useState(document);
  const [isSaving, setIsSaving] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false); // State to make document read-only
  const [signerName, setSignerName] = useState("");

  // Handle content change with debouncing
  const handleChange = (value) => {
    if (!isReadOnly) setContent(value); // Allow changes only if not read-only
  };

  // Function to call API to save the document
  const saveDocument = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/saveDoc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Document saved successfully", data);
      } else {
        console.error("Failed to save document");
      }
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debouncing with useEffect
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout); // Clear the previous timeout if content changes
    }

    const timeout = setTimeout(() => {
      saveDocument(); // Call the saveDocument function after a delay
    }, 1000); // Set the debounce delay (e.g., 1 second)

    setDebounceTimeout(timeout);

    return () => clearTimeout(timeout); // Cleanup the timeout on unmount or before setting a new one
  }, [content]); // Run the effect when the content changes

  // Handle signing the document
  const handleSign = () => {
    const dateOfSigning = new Date().toLocaleDateString();
    const hash = crypto.createHash("sha256").update(content).digest("hex"); // Generate a hash from the document content

    // Append signature details to the content
    const signedContent = `${content}\n\nSigned by: ${signerName} on ${dateOfSigning}\nHash: ${hash}`;

    setContent(signedContent); // Update the content with the signature
    setIsReadOnly(true); // Make the document read-only after signing

    saveDocument(); // Save the signed document
  };

  return (
    <div className="w-full h-screen font-inter">
      <MDEditor className="w-3/4" value={content} onChange={handleChange} preview={(isReadOnly && !isOtherParty) ? "preview" : "edit"} />

      <div>
        {!isReadOnly && (
          <Dialog>
            <DialogTrigger>
              <Button>Sign Here</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to sign this?</DialogTitle>
                <DialogDescription>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSign();
                    }}
                  >
                    <Label htmlFor="Name">Enter Name for Sign:</Label>
                    <Input
                      type="text"
                      name="Name"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      required
                    />
                    <Button type="submit">Sign</Button>
                  </form>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}

        {isOtherParty && !isReadOnly && (
          <Button onClick={() => setIsReadOnly(false)}>Add Your Signature</Button>
        )}
      </div>

      {!isReadOnly && <Button disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>}
    </div>
  );
};

export default MarkdownEdit;
