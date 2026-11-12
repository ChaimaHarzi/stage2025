import React from "react";
import Button from "./Button";

export const inputClass =
  "block w-full h-10 [&:is(select)]:pr-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:disabled:bg-slate-800";

export const textareaClass = `${inputClass} h-auto py-2 resize-none`;

export const inputErrorClass = "border-red-400 focus:border-red-500 focus:ring-red-500/15 dark:border-red-500/70";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/** Libellé + champ + message d'erreur (scénarios « champs obligatoires manquants »). */
export function FormField({ label, required, error, hint, className, children }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

/** Pied de formulaire : Annuler / Valider, alignés à droite. */
export function FormActions({
  onCancel,
  submitting,
  submitLabel,
  className = "",
}: {
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
  className?: string;
}) {
  return (
    <div className={`-mx-6 -mb-6 mt-6 flex justify-end gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60 ${className}`}>
      <Button variant="secondary" onClick={onCancel}>
        Annuler
      </Button>
      <Button type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </div>
  );
}
