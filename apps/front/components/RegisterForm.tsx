"use client";
import { AlertCircle, ArrowLeft, Check } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { graphqlRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { validateUser, type UserForm } from "@/lib/validation";
import AuthLayout from "./auth/AuthLayout";
import Button from "./shared/ui/Button";
import { FormField, inputClass, inputErrorClass } from "./shared/ui/FormField";

const EMPTY: UserForm = { nom: "", prenom: "", email: "", telephone: "", genre: "", dateDeNaissance: "", password: "" };

/** Indications affichées sous le mot de passe, cochées au fur et à mesure. */
const PASSWORD_RULES = [
  { label: "8 caractères minimum", test: (v: string) => v.length >= 8 },
  { label: "Une majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Une minuscule", test: (v: string) => /[a-z]/.test(v) },
  { label: "Un chiffre", test: (v: string) => /\d/.test(v) },
];

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<UserForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const field = (k: keyof UserForm) => ({
    name: k,
    value: form[k] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [k]: e.target.value });
      if (errors[k]) setErrors({ ...errors, [k]: undefined });
    },
    className: cn(inputClass, "h-11", errors[k] && inputErrorClass),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs = validateUser(form, { passwordRequired: true });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPending(true);
    // Le rôle n'est pas envoyé : l'API crée toujours un compte ouvrier à l'inscription publique.
    const input = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      telephone: form.telephone.trim(),
      email: form.email.trim(),
      password: form.password,
      genre: form.genre,
      dateDeNaissance: form.dateDeNaissance,
    };
    try {
      await graphqlRequest(`mutation SignUp($input: SignUpInput!) { signUp(input: $input) { id } }`, { input });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue, veuillez réessayer.";
      if (message.includes("email")) setErrors({ email: message });
      else setError(message);
      setPending(false);
      return;
    }
    // Connexion automatique, puis redirection vers l'espace ouvrier.
    const result = await signIn("credentials", { email: input.email, password: input.password, redirect: false });
    router.replace(result?.ok ? "/ouvrier" : "/");
    router.refresh();
  };

  return (
    <AuthLayout>
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Retour à la connexion
      </Link>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Créer un compte ouvrier</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Renseignez vos informations pour accéder à l&apos;espace atelier.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2" noValidate>
        <FormField label="Prénom" required error={errors.prenom}>
          <input {...field("prenom")} autoComplete="given-name" autoFocus />
        </FormField>
        <FormField label="Nom" required error={errors.nom}>
          <input {...field("nom")} autoComplete="family-name" />
        </FormField>
        <FormField label="Adresse email" required error={errors.email} className="sm:col-span-2">
          <input {...field("email")} type="email" autoComplete="email" placeholder="prenom.nom@sagemcom.com" />
        </FormField>
        <FormField label="Téléphone" required error={errors.telephone}>
          <input {...field("telephone")} inputMode="numeric" autoComplete="tel" placeholder="22123456" />
        </FormField>
        <FormField label="Genre" required error={errors.genre}>
          <select {...field("genre")}>
            <option value="">Sélectionner</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
        </FormField>
        <FormField label="Date de naissance" required error={errors.dateDeNaissance} className="sm:col-span-2">
          <input {...field("dateDeNaissance")} type="date" />
        </FormField>
        <FormField label="Mot de passe" required error={errors.password} className="sm:col-span-2">
          <input {...field("password")} type="password" autoComplete="new-password" />
          <ul className="mt-2 grid grid-cols-2 gap-1.5">
            {PASSWORD_RULES.map((r) => {
              const ok = r.test(form.password);
              return (
                <li key={r.label} className={cn("flex items-center gap-1.5 text-xs", ok ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")}>
                  <Check className={cn("h-3.5 w-3.5", !ok && "opacity-40")} /> {r.label}
                </li>
              );
            })}
          </ul>
        </FormField>

        <Button type="submit" size="lg" loading={pending} className="w-full sm:col-span-2">
          {pending ? "Création du compte…" : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Déjà inscrit ?{" "}
        <Link href="/" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}
