'use client';

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { MOCK_PROFILES } from "@/lib/mockProfiles";

export interface FormFieldSchema {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number" | "email" | string;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  options?: string[];
  required?: boolean;
}

export interface DynamicFormSchema {
  form_title: string;
  target_action: string;
  fields: FormFieldSchema[];
}

export interface DynamicFormRendererProps {
  schema: DynamicFormSchema;
  onSubmit: (formData: Record<string, any>, schema: DynamicFormSchema) => void;
  isSubmitting?: boolean;
}

export function DynamicFormRenderer({
  schema,
  onSubmit,
  isSubmitting = false,
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Initialize form state whenever schema changes
  useEffect(() => {
    const initialData: Record<string, any> = {};
    schema.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      } else if (field.type === "select" && field.options && field.options.length > 0) {
        initialData[field.id] = field.options[0];
      } else {
        initialData[field.id] = "";
      }
    });
    setFormData(initialData);
    setErrors({});
    setAutoFilledFields([]);
  }, [schema]);

  const handleInputChange = (fieldId: string, value: any) => {
    // If field is Aadhaar/identity, preserve redaction
    if (
      (fieldId.toLowerCase().includes("aadhaar") || fieldId.toLowerCase().includes("id_proof")) &&
      value !== "[Aadhaar Redacted]"
    ) {
      value = "[Aadhaar Redacted]";
    }

    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleAutoFill = () => {
    const profile = MOCK_PROFILES[0]; // Ramesh Sharma default mock profile
    const updated = { ...formData };
    const filled: string[] = [];

    schema.fields.forEach((f) => {
      const idLower = f.id.toLowerCase();
      const labelLower = f.label.toLowerCase();

      if (idLower.includes("name") || labelLower.includes("name")) {
        updated[f.id] = profile.name;
        filled.push(f.id);
      } else if (
        idLower.includes("dob") ||
        idLower.includes("birth") ||
        labelLower.includes("birth") ||
        labelLower.includes("dob")
      ) {
        updated[f.id] = profile.dob;
        filled.push(f.id);
      } else if (
        idLower.includes("veh") ||
        labelLower.includes("vehicle") ||
        idLower.includes("rc") ||
        labelLower.includes("rc_number") ||
        idLower.includes("reg")
      ) {
        updated[f.id] = profile.vehicleNo;
        filled.push(f.id);
      } else if (
        idLower.includes("aadhaar") ||
        idLower.includes("id_proof") ||
        labelLower.includes("aadhaar") ||
        labelLower.includes("identity")
      ) {
        // Strict Aadhaar Redaction Rule
        updated[f.id] = "[Aadhaar Redacted]";
        filled.push(f.id);
      } else if (idLower.includes("pan") || labelLower.includes("pan")) {
        updated[f.id] = profile.pan;
        filled.push(f.id);
      } else if (idLower.includes("phone") || labelLower.includes("mobile")) {
        updated[f.id] = profile.phone || "+91 98765 43210";
        filled.push(f.id);
      } else if (idLower.includes("email") || labelLower.includes("email")) {
        updated[f.id] = profile.email || "ramesh.sharma@example.gov.in";
        filled.push(f.id);
      } else if (idLower.includes("address") || labelLower.includes("address")) {
        updated[f.id] = profile.address || "B-42, Janakpuri, New Delhi, 110058";
        filled.push(f.id);
      } else if (
        idLower.includes("city") ||
        labelLower.includes("city") ||
        idLower.includes("psk") ||
        labelLower.includes("location") ||
        idLower.includes("rpo")
      ) {
        if (f.options && f.options.length > 0) {
          const matchOpt =
            f.options.find((o) => o.toLowerCase().includes("delhi")) || f.options[0];
          updated[f.id] = matchOpt;
        } else {
          updated[f.id] = "Delhi PSK - Herald House, ITO";
        }
        filled.push(f.id);
      } else if (idLower.includes("fine") || idLower.includes("amount") || labelLower.includes("amount")) {
        updated[f.id] = "₹1,000";
        filled.push(f.id);
      } else if (idLower.includes("challan") || labelLower.includes("challan")) {
        updated[f.id] = "CH-2026-88349";
        filled.push(f.id);
      } else if (f.type === "date" && !updated[f.id]) {
        updated[f.id] = "2026-03-05";
        filled.push(f.id);
      }
    });

    setFormData(updated);
    setAutoFilledFields(filled);
    setErrors({});
  };

  const handleReset = () => {
    const resetData: Record<string, any> = {};
    schema.fields.forEach((field) => {
      resetData[field.id] = field.defaultValue || "";
    });
    setFormData(resetData);
    setErrors({});
    setAutoFilledFields([]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    schema.fields.forEach((field) => {
      if (field.required) {
        const val = formData[field.id];
        if (val === undefined || val === null || String(val).trim() === "") {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLocalSubmitting(true);
    try {
      onSubmit(formData, schema);
    } finally {
      setTimeout(() => setLocalSubmitting(false), 500);
    }
  };

  const shortFields = schema.fields.filter((f) => f.type !== "textarea");
  const textareaFields = schema.fields.filter((f) => f.type === "textarea");
  const submittingActive = isSubmitting || localSubmitting;

  return (
    <Card className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-md overflow-hidden text-left">
      {/* Header */}
      <div className="bg-slate-900 px-5 py-4 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-tight">
              {schema.form_title}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Action: {schema.target_action}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoFill}
          disabled={submittingActive}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
          title="Auto-fill with mock profile"
        >
          <Zap className="h-3.5 w-3.5 fill-current text-amber-300" />
          <span>Auto-fill Mock Profile</span>
        </button>
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Short & Select Fields Grid */}
        {shortFields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {shortFields.map((field) => {
              const isAutoFilled = autoFilledFields.includes(field.id);
              const hasError = !!errors[field.id];

              return (
                <div key={field.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`field-${field.id}`}
                      className="text-xs font-semibold text-slate-700"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1 font-bold">*</span>
                      )}
                    </label>
                    {isAutoFilled && (
                      <span className="text-[10px] font-medium text-emerald-600">
                        ⚡ Auto-filled
                      </span>
                    )}
                  </div>

                  {field.type === "select" ? (
                    <div className="relative">
                      <select
                        id={`field-${field.id}`}
                        value={formData[field.id] || ""}
                        disabled={submittingActive}
                        onChange={(e) =>
                          handleInputChange(field.id, e.target.value)
                        }
                        className={`w-full bg-slate-50 border ${
                          hasError
                            ? "border-red-400 ring-1 ring-red-400"
                            : "border-slate-300"
                        } rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-colors pr-8 cursor-pointer disabled:opacity-60`}
                      >
                        {field.options && field.options.length > 0 ? (
                          field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))
                        ) : (
                          <option value="">Select option</option>
                        )}
                      </select>
                      <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  ) : field.type === "date" ? (
                    <input
                      id={`field-${field.id}`}
                      type="date"
                      value={formData[field.id] || ""}
                      disabled={submittingActive}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                      className={`bg-slate-50 border ${
                        hasError
                          ? "border-red-400 ring-1 ring-red-400"
                          : "border-slate-300"
                      } rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-colors disabled:opacity-60`}
                    />
                  ) : (
                    <input
                      id={`field-${field.id}`}
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={
                        field.placeholder ||
                        `Enter ${field.label.toLowerCase()}...`
                      }
                      value={formData[field.id] || ""}
                      disabled={
                        submittingActive ||
                        field.id.toLowerCase().includes("aadhaar") ||
                        field.id.toLowerCase().includes("id_proof")
                      }
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                      className={`bg-slate-50 border ${
                        hasError
                          ? "border-red-400 ring-1 ring-red-400"
                          : "border-slate-300"
                      } rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-colors disabled:opacity-60`}
                    />
                  )}

                  {hasError && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium pt-0.5">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Textarea Fields */}
        {textareaFields.map((field) => {
          const isAutoFilled = autoFilledFields.includes(field.id);
          const hasError = !!errors[field.id];

          return (
            <div key={field.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`field-${field.id}`}
                  className="text-xs font-semibold text-slate-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1 font-bold">*</span>
                  )}
                </label>
                {isAutoFilled && (
                  <span className="text-[10px] font-medium text-emerald-600">
                    ⚡ Auto-filled
                  </span>
                )}
              </div>

              <textarea
                id={`field-${field.id}`}
                rows={3}
                disabled={submittingActive}
                placeholder={
                  field.placeholder ||
                  `Enter ${field.label.toLowerCase()} details here...`
                }
                value={formData[field.id] || ""}
                onChange={(e) =>
                  handleInputChange(field.id, e.target.value)
                }
                className={`bg-slate-50 border ${
                  hasError
                    ? "border-red-400 ring-1 ring-red-400"
                    : "border-slate-300"
                } rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 resize-none transition-colors disabled:opacity-60`}
              />

              {hasError && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium pt-0.5">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors[field.id]}
                </p>
              )}
            </div>
          );
        })}

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <Button
            type="submit"
            disabled={submittingActive}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 h-11"
          >
            {submittingActive ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Forwarding to Gateway Server...</span>
              </>
            ) : (
              <>
                <span>{schema.target_action}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] text-slate-400">
              {schema.fields.length} schema fields defined
            </span>
            <button
              type="button"
              onClick={handleReset}
              disabled={submittingActive}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" /> Reset form
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}
