import { model, fileManager, FileState, handleFunctionCall, createHandleFunctionCall } from "@/lib/gemini";
import fs from "fs";
import os from "os";
import path from "path";
import type { StructuredContract } from "@/lib/contractSchema";
import { auth } from "@/auth";
import { db } from "@/lib/firebaseAdmin";
import defaultTemplates from "@/lib/templates";
import type { ContractTemplate } from "@/lib/templates";

/**
 * Runs a function-calling loop with the model until it returns a final text
 * response (the structured JSON contract).  Each iteration checks for
 * functionCall parts, executes them, and feeds the results back.
 */
async function runWithFunctionCalling(
  chat: any,
  initialParts: any[],
  fnCallHandler: (name: string, args: Record<string, any>) => Promise<any> = handleFunctionCall
): Promise<StructuredContract> {
  let response = await chat.sendMessage(initialParts);

  // Loop while the model keeps requesting function calls
  while (true) {
    const candidate = response.response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    // Collect all function calls in this turn
    const fnCalls = parts.filter((p: any) => p.functionCall);

    if (fnCalls.length === 0) {
      // No more function calls — parse the final JSON response
      const text = response.response.text();
      try {
        return JSON.parse(text) as StructuredContract;
      } catch {
        // Model sometimes wraps JSON in markdown fences
        const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) return JSON.parse(match[1]) as StructuredContract;
        throw new Error("Model did not return valid JSON");
      }
    }

    // Execute each function call and build response parts
    const functionResponseParts: any[] = [];
    for (const part of fnCalls) {
      const { name, args } = part.functionCall;
      const result = await fnCallHandler(name, args);
      functionResponseParts.push({
        functionResponse: {
          name,
          response: { content: result },
        },
      });
    }

    // Feed function results back to the model
    response = await chat.sendMessage(functionResponseParts);
  }
}

/** Fetch the authenticated user's templates from Firestore (seeding defaults if needed). */
async function getUserTemplates(): Promise<ContractTemplate[]> {
  const session = await auth();
  if (!session?.user?.id) return defaultTemplates;

  const userId = session.user.id;
  const snap = await db
    .collection("userTemplates")
    .doc(userId)
    .collection("templates")
    .get();

  if (!snap.empty) {
    return snap.docs.map((d) => d.data() as ContractTemplate);
  }

  // Seed defaults for new user
  const batch = db.batch();
  for (const tpl of defaultTemplates) {
    const ref = db
      .collection("userTemplates")
      .doc(userId)
      .collection("templates")
      .doc(tpl.type);
    batch.set(ref, tpl);
  }
  await batch.commit();
  return [...defaultTemplates];
}

export async function POST(req: Request) {
  try {
    const { audioBase64, mimeType, description, companyDetails } =
      await req.json();

    const { companyName, companyCity, companyCountry, position } =
      companyDetails ?? {};

    const userContext = `User Details: Company - ${companyName ?? "N/A"}, ${position ?? "N/A"}, located in ${companyCity ?? "N/A"}, ${companyCountry ?? "N/A"}. Date: ${new Date().toISOString().split("T")[0]}`;

    // Start a chat session so the function-calling loop has context
    const chat = model.startChat();
    const parts: any[] = [];

    // ── Handle audio upload ────────────────────────────────────
    if (audioBase64 && mimeType) {
      const base64Data = audioBase64.split(",")[1];
      const audioBuffer = Buffer.from(base64Data, "base64");

      const tempDir = os.tmpdir();
      const tempFilePath = path.join(
        tempDir,
        `uploaded_audio_${Date.now()}.mp3`
      );
      fs.writeFileSync(tempFilePath, audioBuffer);

      const uploadResult = await fileManager.uploadFile(tempFilePath, {
        mimeType,
        displayName: "Uploaded Call Recording",
      });

      // Wait for processing
      let file = await fileManager.getFile(uploadResult.file.name);
      while (file.state === FileState.PROCESSING) {
        await new Promise((r) => setTimeout(r, 5000));
        file = await fileManager.getFile(uploadResult.file.name);
      }
      if (file.state === FileState.FAILED) {
        throw new Error("Audio processing failed.");
      }

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      parts.push({
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      });
    }

    // ── Build prompt ───────────────────────────────────────────
    let prompt =
      "Analyze the provided inputs and draft a professional legal contract. " +
      "First call listTemplates to see available templates, then call getTemplate with the most appropriate type. " +
      "Adapt the template clauses to the negotiated terms. " +
      "Replace all placeholders with actual values where discussed. " +
      "Return the contract as structured JSON.\n\n";

    if (description) {
      prompt += `Description of the agreement:\n${description}\n\n`;
    }
    prompt += userContext;

    if (!audioBase64 && !description) {
      throw new Error("Either audio or description must be provided.");
    }

    parts.push({ text: prompt });

    // ── Fetch user-specific templates ──────────────────────────
    const userTemplates = await getUserTemplates();
    const userFnHandler = createHandleFunctionCall(userTemplates);

    // ── Run the function-calling loop ──────────────────────────
    const contract = await runWithFunctionCalling(chat, parts, userFnHandler);

    return new Response(JSON.stringify({ contract }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}