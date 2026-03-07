/**
 * Type definitions for the structured contract output from Gemini.
 */

export interface ContractClause {
  /** Unique clause identifier, e.g. "emp-3" or "custom-1" */
  id: string;
  /** Clause text content */
  text: string;
  /** Whether this clause contains an unresolved placeholder */
  isPlaceholder: boolean;
}

export interface ContractSection {
  /** Section heading, e.g. "Compensation", "Confidentiality" */
  heading: string;
  /** Ordered list of clauses within this section */
  clauses: ContractClause[];
}

export interface ContractParty {
  /** Role label, e.g. "Employer", "Client", "Landlord" */
  role: string;
  /** Name of the party */
  name: string;
}

export interface StructuredContract {
  /** Contract title, e.g. "Employment Agreement" */
  title: string;
  /** The parties involved in this contract */
  parties: ContractParty[];
  /** Effective date of the contract (ISO string or human-readable) */
  effectiveDate: string;
  /** Ordered sections of the contract */
  sections: ContractSection[];
  /** Governing jurisdiction for legality */
  governingLaw: string;
  /** Any extra metadata notes the model wants to surface */
  notes: string[];
}

/**
 * Gemini JSON schema for structured contract output.
 * Used with responseSchema in the model config.
 */
export const contractResponseSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "The title of the contract",
    },
    parties: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: {
            type: "string",
            description:
              "Role label for this party, e.g. Employer, Employee, Client",
          },
          name: {
            type: "string",
            description: "Full name of this party",
          },
        },
        required: ["role", "name"],
      },
      description: "The parties involved in the contract",
    },
    effectiveDate: {
      type: "string",
      description:
        "Effective date of the contract in ISO 8601 or human-readable format",
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: {
            type: "string",
            description: "Section heading",
          },
          clauses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Unique clause identifier",
                },
                text: {
                  type: "string",
                  description: "Full clause text",
                },
                isPlaceholder: {
                  type: "boolean",
                  description:
                    "True if this clause still contains an unresolved placeholder that needs user input",
                },
              },
              required: ["id", "text", "isPlaceholder"],
            },
          },
        },
        required: ["heading", "clauses"],
      },
      description: "Ordered sections of the contract body",
    },
    governingLaw: {
      type: "string",
      description: "Governing law jurisdiction",
    },
    notes: {
      type: "array",
      items: { type: "string" },
      description:
        "Any notes, warnings, or observations the model wants to surface to the user",
    },
  },
  required: [
    "title",
    "parties",
    "effectiveDate",
    "sections",
    "governingLaw",
    "notes",
  ],
};
