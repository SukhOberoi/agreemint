import {
  GoogleGenerativeAI,
  SchemaType,
  FunctionCallingMode,
  type FunctionDeclaration,
} from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { contractResponseSchema } from "./contractSchema";
import { listTemplates, getTemplate } from "./templates";
import type { ContractTemplate } from "./templates";

// ── API plumbing ────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

// ── System prompt ───────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a cautious legal associate. Your task is to draft a contract based only on the provided audio, user prompt, and user profile.

WORKFLOW:
1. Analyse the audio recording and/or text description to extract every discussed term (parties, roles, compensation, dates, scope, etc.).
2. Call the "listTemplates" function to see available template types.
3. Call the "getTemplate" function with the most appropriate template type.
4. Adapt the retrieved template clauses to match the negotiated terms.
5. If a required term was NOT discussed, you MUST insert a placeholder in square brackets (e.g. [NOTICE_PERIOD]) and mark that clause as isPlaceholder: true.
6. Return your output as structured JSON matching the provided schema — never return markdown or plain text.

RULES:
- Be precise with legal language. Do not invent terms that were not discussed.
- Always include governing law and dispute resolution sections.
- Dates should be in ISO 8601 format where possible.
- Include helpful notes for any assumptions you made or placeholders you inserted.`;

// ── Function-calling tool declarations ──────────────────────────
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "listTemplates",
    description:
      "Returns a list of all available contract template types with their names and descriptions. Call this first to decide which template to use.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: "getTemplate",
    description:
      "Retrieves the full clause-level skeleton for a given contract template type. Use the type value returned by listTemplates.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        type: {
          type: SchemaType.STRING,
          description:
            'The template type identifier, e.g. "employment", "nda", "service", "freelance", "lease", "partnership".',
        },
      },
      required: ["type"],
    },
  },
];

// ── Model configured for generation (structured JSON output + tools) ──
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction: SYSTEM_PROMPT,
  tools: [{ functionDeclarations }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: contractResponseSchema as any,
  },
});

// ── Chat model (for follow-up amendments — no forced JSON) ──────
const chatModel = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction: `You are the same cautious legal associate. The user has an existing contract (provided as JSON). They will ask you to make amendments. 
  
RULES:
- Return the FULL updated contract as structured JSON matching the original schema.
- Only change the sections the user asks about. Keep everything else identical.
- If the user's request is ambiguous, add a note explaining your interpretation.
- Never remove sections unless explicitly asked.
- Maintain all clause IDs — only change the text.`,
  tools: [{ functionDeclarations }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: contractResponseSchema as any,
  },
});

// ── Helper: execute function calls requested by the model ───────

/**
 * Default handler — uses the built-in hardcoded templates.
 */
export async function handleFunctionCall(
  functionName: string,
  args: Record<string, any>
) {
  console.log(`[Gemini FN-CALL] ${functionName}`, args);
  switch (functionName) {
    case "listTemplates":
      console.log(`[Gemini FN-CALL] listTemplates → returning ${listTemplates().length} default templates`);
      return listTemplates();
    case "getTemplate":
      console.log(`[Gemini FN-CALL] getTemplate → type: "${args.type}"`);
      return getTemplate(args.type);
    default:
      return { error: `Unknown function: ${functionName}` };
  }
}

/**
 * Create a function-call handler that uses a custom set of templates
 * (e.g. per-user templates fetched from Firestore).
 */
export function createHandleFunctionCall(userTemplates: ContractTemplate[]) {
  return async function (functionName: string, args: Record<string, any>) {
    console.log(`[Gemini FN-CALL] ${functionName}`, args);
    switch (functionName) {
      case "listTemplates":
        console.log(`[Gemini FN-CALL] listTemplates → returning ${userTemplates.length} user templates`);
        return userTemplates.map(({ type, displayName, description }) => ({
          type,
          displayName,
          description,
        }));
      case "getTemplate": {
        const found = userTemplates.find((t) => t.type === args.type) ?? null;
        console.log(`[Gemini FN-CALL] getTemplate → type: "${args.type}", found: ${!!found}`);
        return found;
      }
      default:
        return { error: `Unknown function: ${functionName}` };
    }
  };
}

export { model, chatModel, fileManager, FileState, genAI, SYSTEM_PROMPT };