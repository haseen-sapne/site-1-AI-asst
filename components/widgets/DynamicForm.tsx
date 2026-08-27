'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number';
  options?: (string | { value: string; label: string })[];
  required?: boolean;
  placeholder?: string;
}

interface DynamicFormProps {
  result: {
    serviceId: string;
    serviceName: string;
    submitUrl: string;
    fields: FormField[];
    prefilledData: Record<string, any>;
  };
}

export function DynamicForm({ result }: DynamicFormProps) {
  const { serviceName, submitUrl, fields = [], prefilledData = {} } = result;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Merge already known context with the newly filled form inputs
    const finalPayload = {
      ...prefilledData,
      ...formData,
    };

    const targetUrl = submitUrl?.startsWith('http') ? '/api/proxy/submit' : (submitUrl || '/api/proxy/submit');

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessData(data);
      } else {
        setErrorMessage(data?.error || data?.message || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Dynamic form submission error:', err);
      setErrorMessage('Could not connect to service servers.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    const details = successData.data || successData;
    return (
      <Card className="p-5 bg-white dark:bg-[#1e2430] border border-emerald-200 dark:border-emerald-800/60 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">Application Submitted Successfully</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Your application has been registered directly with the microservice database.
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Application Reference:</span>
            <p className="font-bold font-mono text-blue-600 dark:text-blue-400">{details.appId || successData.draftId}</p>
          </div>
          {details.appointment?.tokenNumber && (
            <div>
              <span className="text-slate-400">Token ID:</span>
              <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{details.appointment.tokenNumber}</p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  const prefilledKeys = Object.keys(prefilledData);

  return (
    <Card className="p-5 bg-white dark:bg-[#1e2430] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#9bb3f7]" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{serviceName}</h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-slate-500">
          Direct Application
        </Badge>
      </div>

      {prefilledKeys.length > 0 && (
        <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs space-y-1">
          <span className="font-medium text-blue-800 dark:text-blue-300">Auto-filled from conversation:</span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {prefilledKeys.map((key) => (
              <span key={key} className="px-2 py-0.5 bg-white dark:bg-[#1a212d] border rounded text-[11px] text-slate-700 dark:text-slate-300">
                <strong>{key}:</strong> {String(prefilledData[key])}
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id || `field-${index}`} className="space-y-1 text-xs">
            <label className="block font-medium text-slate-700 dark:text-slate-300">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'select' ? (
              <select
                required={field.required}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#181e28] text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#9bb3f7]"
              >
                <option value="">Select an option...</option>
                {field.options?.map((opt: any, oi: number) => {
                  // Gemini may send options as strings or {value, label} objects
                  const val = typeof opt === 'object' ? (opt.value || opt.label || '') : String(opt);
                  const label = typeof opt === 'object' ? (opt.label || opt.value || '') : String(opt);
                  return (
                    <option key={`${val}-${oi}`} value={val}>
                      {label}
                    </option>
                  );
                })}
              </select>
            ) : (
              <Input
                type={field.type}
                required={field.required}
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="h-9 text-xs"
              />
            )}
          </div>
        ))}

        {errorMessage && (
          <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#9bb3f7] hover:bg-[#8ea8f7] text-slate-950 font-semibold text-xs h-9 rounded-lg transition"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Submitting Application...</span>
            </div>
          ) : (
            'Submit Application'
          )}
        </Button>
      </form>
    </Card>
  );
}