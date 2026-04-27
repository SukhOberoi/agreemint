import { chatModel, handleFunctionCall } from "@/lib/gemini";
import type { StructuredContract } from "@/lib/contractSchema";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

/**
 * POST /api/chat
 * Body: { documentId, contract, conversationHistory, userMessage }
 *
 * Sends the current contract + conversation history + new user message
 * to Gemini's chat API to produce an amended contract.
 */
export async function POST(req: Request) {
  try {
    const { documentId, contract, conversationHistory, userMessage } =
      await req.json();

    if (!contract || !userMessage) {
      return new Response(
        JSON.stringify({
          error: "contract and userMessage are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the chat history for Gemini
    const history: any[] = [];

    // First message in history: the original contract as context
    history.push({
      role: "user",
      parts: [
        {
          text: `Here is the current contract as JSON. All amendments should be applied to this contract and the full updated contract should be returned.\n\n${JSON.stringify(contract, null, 2)}`,
        },
      ],
    });
    history.push({
      role: "model",
      parts: [
        {
          text: "I have the contract. What amendments would you like to make?",
        },
      ],
    });

    // Append prior conversation turns
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory as ChatMessage[]) {
        history.push({
          role: msg.role,
          parts: [{ text: msg.text }],
        });
      }
    }

    // Start chat with history
    const chat = chatModel.startChat({ history });

    // Send the new user message
    let response = await chat.sendMessage([{ text: userMessage }]);

    // Handle function-calling loop (model may want template data)
    while (true) {
      const candidate = response.response.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];
      const fnCalls = parts.filter((p: any) => p.functionCall);

      if (fnCalls.length === 0) break;

      const functionResponseParts: any[] = [];
      for (const part of fnCalls) {
        const { name, args } = part.functionCall;
        const result = await handleFunctionCall(name, args);
        functionResponseParts.push({
          functionResponse: {
            name,
            response: { content: result },
          },
        });
      }
      response = await chat.sendMessage(functionResponseParts);
    }

    // Parse the structured JSON response
    const text = response.response.text();
    let updatedContract: StructuredContract;
    try {
      updatedContract = JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        updatedContract = JSON.parse(match[1]);
      } else {
        throw new Error("Model did not return valid JSON for the amendment");
      }
    }

    return new Response(
      JSON.stringify({
        contract: updatedContract,
        modelResponse: userMessage, // echo back for history tracking
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in chat amendment:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
