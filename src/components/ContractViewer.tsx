"use client";
import React from "react";
import type { StructuredContract } from "@/lib/contractSchema";

interface ContractViewerProps {
  contract: StructuredContract;
  onPlaceholderClick?: (placeholder: string) => void;
}

/**
 * Splits clause text on [PLACEHOLDER] tokens and renders them as clickable buttons.
 */
function renderClauseText(
  text: string,
  onPlaceholderClick?: (placeholder: string) => void
) {
  const parts = text.split(/(\[[A-Z][A-Z0-9_]*\])/g);
  return parts.map((part, i) => {
    if (/^\[[A-Z][A-Z0-9_]*\]$/.test(part)) {
      return (
        <button
          key={i}
          type="button"
          onClick={() => onPlaceholderClick?.(part)}
          className="inline rounded bg-yellow/30 px-1 py-0.5 font-mono text-xs font-semibold text-yellow-800 hover:bg-yellow/50 cursor-pointer transition-colors border border-yellow/40 hover:border-yellow/60"
          title={`Click to fill ${part}`}
        >
          {part}
        </button>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const ContractViewer: React.FC<ContractViewerProps> = ({ contract, onPlaceholderClick }) => {
  return (
    <div className="mx-auto max-w-3xl font-inter">
      <h1 className="mb-2 text-center text-2xl font-bold uppercase tracking-wide text-gray-900">
        {contract.title}
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Effective Date: {contract.effectiveDate}
      </p>
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-600">
          Parties
        </h2>
        <ul className="space-y-1">
          {contract.parties.map((party, i) => (
            <li key={i} className="text-sm text-gray-800">
              <span className="font-medium text-bottlegreen">{party.role}:</span>{" "}
              {party.name}
            </li>
          ))}
        </ul>
      </div>
      {contract.sections.map((section, sIdx) => (
        <div key={sIdx} className="mb-6">
          <h2 className="mb-3 border-b border-gray-200 pb-1 text-lg font-semibold text-gray-800">
            {sIdx + 1}. {section.heading}
          </h2>
          <div className="space-y-2 pl-4">
            {section.clauses.map((clause) => (
              <div
                key={clause.id}
                className={`rounded-md px-3 py-2 text-sm leading-relaxed ${
                  clause.isPlaceholder
                    ? "border-l-4 border-yellow bg-yellow/10 text-gray-800"
                    : "text-gray-700"
                }`}
              >
                {clause.isPlaceholder && (
                  <span className="mr-2 inline-block rounded bg-yellow/20 px-1.5 py-0.5 text-xs font-semibold uppercase text-yellow-800">
                    Needs Input
                  </span>
                )}
                {renderClauseText(clause.text, onPlaceholderClick)}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-600">
          Governing Law
        </h2>
        <p className="text-sm text-gray-700">{contract.governingLaw}</p>
      </div>
      {contract.notes && contract.notes.length > 0 && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
            Notes & Observations
          </h2>
          <ul className="list-inside list-disc space-y-1">
            {contract.notes.map((note, i) => (
              <li key={i} className="text-sm text-blue-800">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ContractViewer;
