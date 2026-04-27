"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SessionProvider } from "next-auth/react";
import type { ContractTemplate, TemplateClause } from "@/lib/templates";
import { ClipLoader } from "react-spinners";

/* ────────────────────────────────────────────────────────────── */
/*  Clause editor – used inside the template dialog               */
/* ────────────────────────────────────────────────────────────── */
function ClauseRow({
  clause,
  onChange,
  onRemove,
}: {
  clause: TemplateClause;
  onChange: (c: TemplateClause) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/30">
      <div className="flex items-center gap-2">
        <Input
          className="font-semibold text-sm flex-1"
          value={clause.heading}
          placeholder="Clause heading"
          onChange={(e) => onChange({ ...clause, heading: e.target.value })}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive shrink-0"
          onClick={onRemove}
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </Button>
      </div>
      <textarea
        className="w-full rounded-md border p-2 text-sm min-h-[60px] resize-y bg-background"
        value={clause.text}
        placeholder="Clause text — use [PLACEHOLDER] for fillable fields"
        onChange={(e) => onChange({ ...clause, text: e.target.value })}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Template edit / create dialog                                 */
/* ────────────────────────────────────────────────────────────── */
function TemplateDialog({
  initial,
  open,
  onOpenChange,
  onSave,
  mode,
}: {
  initial: ContractTemplate;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (tpl: ContractTemplate) => Promise<void>;
  mode: "create" | "edit";
}) {
  const [tpl, setTpl] = useState<ContractTemplate>(initial);
  const [saving, setSaving] = useState(false);

  // Sync with new initial when dialog opens for a different template
  useEffect(() => {
    setTpl(initial);
  }, [initial]);

  const updateClause = (idx: number, clause: TemplateClause) => {
    const next = [...tpl.clauses];
    next[idx] = clause;
    setTpl({ ...tpl, clauses: next });
  };

  const removeClause = (idx: number) => {
    setTpl({ ...tpl, clauses: tpl.clauses.filter((_, i) => i !== idx) });
  };

  const addClause = () => {
    const id = `${tpl.type}-${tpl.clauses.length + 1}`;
    setTpl({
      ...tpl,
      clauses: [...tpl.clauses, { id, heading: "", text: "" }],
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(tpl);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New Template" : `Edit: ${tpl.displayName}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new reusable contract template."
              : "Modify the template name, description, and clauses."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Meta fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="tpl-type">Type (ID)</Label>
              <Input
                id="tpl-type"
                value={tpl.type}
                disabled={mode === "edit"}
                placeholder="e.g. consulting"
                onChange={(e) =>
                  setTpl({ ...tpl, type: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="tpl-name">Display Name</Label>
              <Input
                id="tpl-name"
                value={tpl.displayName}
                placeholder="e.g. Consulting Agreement"
                onChange={(e) => setTpl({ ...tpl, displayName: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="tpl-desc">Description</Label>
            <textarea
              id="tpl-desc"
              className="w-full rounded-md border p-2 text-sm min-h-[48px] resize-y bg-background"
              value={tpl.description}
              placeholder="Brief description of when to use this template"
              onChange={(e) => setTpl({ ...tpl, description: e.target.value })}
            />
          </div>

          {/* Clauses */}
          <div className="flex items-center justify-between">
            <Label>Clauses ({tpl.clauses.length})</Label>
            <Button variant="outline" size="sm" onClick={addClause}>
              <span className="material-symbols-outlined text-base mr-1">
                add
              </span>
              Add Clause
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {tpl.clauses.map((clause, idx) => (
              <ClauseRow
                key={clause.id + idx}
                clause={clause}
                onChange={(c) => updateClause(idx, c)}
                onRemove={() => removeClause(idx)}
              />
            ))}
            {tpl.clauses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No clauses yet. Click &quot;Add Clause&quot; to start.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !tpl.type || !tpl.displayName}>
            {saving ? <ClipLoader size={16} color="#fff" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Main page content                                             */
/* ────────────────────────────────────────────────────────────── */
function TemplatesPageContent() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<ContractTemplate | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleEdit = (tpl: ContractTemplate) => {
    setEditTarget(tpl);
    setEditOpen(true);
  };

  const handleSaveEdit = async (tpl: ContractTemplate) => {
    await fetch("/api/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tpl),
    });
    await fetchTemplates();
  };

  const handleCreate = async (tpl: ContractTemplate) => {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tpl),
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.error ?? "Failed to create template");
      throw new Error(data.error);
    }
    await fetchTemplates();
  };

  const handleDelete = async (type: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    await fetch(`/api/templates?type=${encodeURIComponent(type)}`, {
      method: "DELETE",
    });
    await fetchTemplates();
  };

  const handleReset = async () => {
    if (
      !confirm(
        "This will replace all your templates with the built-in defaults. Continue?"
      )
    )
      return;
    setResetting(true);
    try {
      const res = await fetch("/api/templates/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } finally {
      setResetting(false);
    }
  };

  const emptyTemplate: ContractTemplate = {
    type: "",
    displayName: "",
    description: "",
    clauses: [],
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-inter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contract Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Customize the clause skeletons that the AI uses when drafting
            contracts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={resetting}>
            {resetting ? (
              <ClipLoader size={14} />
            ) : (
              <span className="material-symbols-outlined text-base mr-1">
                restart_alt
              </span>
            )}
            Reset to Defaults
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <span className="material-symbols-outlined text-base mr-1">
              add
            </span>
            New Template
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <ClipLoader size={32} />
        </div>
      ) : templates.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">
          No templates found. Create one or reset to defaults.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.type} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tpl.displayName}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {tpl.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {tpl.clauses.length} clause{tpl.clauses.length !== 1 && "s"}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(tpl)}
                  >
                    <span className="material-symbols-outlined text-sm mr-1">
                      edit
                    </span>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(tpl.type)}
                  >
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      {editTarget && (
        <TemplateDialog
          initial={editTarget}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={handleSaveEdit}
          mode="edit"
        />
      )}

      {/* Create dialog */}
      <TemplateDialog
        initial={emptyTemplate}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleCreate}
        mode="create"
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Page wrapper with session                                     */
/* ────────────────────────────────────────────────────────────── */
export default function TemplatesPage() {
  return (
    <SessionProvider>
      <TemplatesPageContent />
    </SessionProvider>
  );
}
