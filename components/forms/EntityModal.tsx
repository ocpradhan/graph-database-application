// Node/Edge creation dialogs
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { GraphNode } from "@/types/graph";
import { toast } from "sonner";

interface EntityModalProps {
  existingNodes: GraphNode[];
  initialData?: GraphNode | null;
  onSuccess: () => void;
  trigger?: React.ReactElement;
}

export function EntityModal({
  existingNodes,
  initialData,
  onSuccess,
  trigger,
}: EntityModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [label, setLabel] = useState<string>("Supplier");
  const [riskScore, setRiskScore] = useState<number>(50);
  const [connectToNodeId, setConnectToNodeId] = useState("");
  const [relationshipType, setRelationshipType] = useState("SUPPLIES");

  const [submitting, setSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEditMode = Boolean(initialData);

  const resetFormState = (isOpening: boolean) => {
    setFieldErrors({});
    if (isOpening && isEditMode && initialData) {
      // Set baseline values immediately when opening edit mode
      setName(initialData.name || "");
      setLabel(initialData.label || "Supplier");
      setRiskScore(initialData.riskScore ?? 50);
    } else {
      // Clear form when closing or opening "Add Entity"
      setName("");
      setLabel("Supplier");
      setRiskScore(50);
      setConnectToNodeId("");
      setRelationshipType("SUPPLIES");
    }
  };

  // Handle open/close state change on the Dialog itself
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    resetFormState(isOpen);
  };

  useEffect(() => {
    if (!open || !isEditMode || !initialData) return;

    let isMounted = true;

    const fetchNodeDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await fetch(
          `/api/nodes/${encodeURIComponent(initialData.id)}`,
        );
        if (res.ok && isMounted) {
          const data = await res.json();
          setName(data.name || initialData.name || "");
          setLabel(data.label || initialData.label || "Supplier");
          setRiskScore(data.riskScore ?? initialData.riskScore ?? 50);
          setConnectToNodeId(data.connectToNodeId || "");
          setRelationshipType(data.relationshipType || "SUPPLIES");
        }
      } catch (error) {
        console.error("Failed to map node details:", error);
        if (isMounted) {
          toast.error("Failed to load full node relationship details.");
        }
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    fetchNodeDetails();

    return () => {
      isMounted = false;
    };
  }, [open, initialData, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const payload = {
      name,
      label,
      riskScore: Number(riskScore),
      connectToNodeId: connectToNodeId || undefined,
      relationshipType: connectToNodeId ? relationshipType : undefined,
    };

    try {
      if (isEditMode && initialData) {
        // PUT request for editing
        const res = await fetch(`/api/nodes/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await res.json();

        if (res.ok) {
          toast.success("Entity edited successfully.");
        } else {
          if (res.status === 400 && resData.errors) {
            setFieldErrors(resData.errors);
            toast.error("Please fix the errors in the form.");
          } else {
            toast.error("Failed edit an entity.");
          }
          return;
        }
      } else {
        const res = await fetch("/api/nodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await res.json();

        if (res.ok) {
          toast.success("Entity added successfully.");
        } else {
          if (res.status === 400 && resData.errors) {
            setFieldErrors(resData.errors);
            toast.error("Please fix the errors in the form.");
          } else {
            toast.error("Failed edit an entity.");
          }
          return;
        }
      }

      handleOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create node:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const availableTargetNodes = existingNodes.filter(
    (n) => n.id !== initialData?.id,
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ? (
            trigger
          ) : (
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Add Entity
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Entity Details" : "Add New Entity to Graph"}
          </DialogTitle>
        </DialogHeader>

        {loadingDetails ? (
          <div className="py-8 text-center text-sm font-medium text-slate-500 animate-pulse">
            Fetching entity relationship details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Entity Name
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                placeholder="e.g. Taiwan Semiconductor Co."
                className={`mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Node Type (Label)
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Supplier">Supplier</option>
                  <option value="Component">Component</option>
                  <option value="Product">Product</option>
                  <option value="LogisticsHub">Logistics Hub</option>
                </select>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Risk Score (0 - 100)
              </label>
              <input
                type="number"
                value={riskScore}
                onChange={(e) => {
                  const val = e.target.value;
                  setRiskScore(Number(val));
                  if (fieldErrors.riskScore) {
                    setFieldErrors((prev) => ({ ...prev, riskScore: "" }));
                  }
                }}
                className={`mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.riskScore
                    ? "border-red-500 focus:ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              />
              {fieldErrors.riskScore && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {fieldErrors.riskScore}
                </p>
              )}
            </div>

            <hr className="my-2" />

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Connect To Existing Entity (Optional)
              </label>
              <select
                value={connectToNodeId}
                onChange={(e) => setConnectToNodeId(e.target.value)}
                className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- None (Orphan Node) --</option>
                {availableTargetNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.label})
                  </option>
                ))}
              </select>
            </div>

            {connectToNodeId && (
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Relationship Type
                </label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SUPPLIES">SUPPLIES</option>
                  <option value="PART_OF">PART_OF</option>
                  <option value="SHIPPED_VIA">SHIPPED_VIA</option>
                </select>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting
                ? "Saving..."
                : isEditMode
                  ? "Update Entity Details"
                  : "Create Entity & Connect"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
