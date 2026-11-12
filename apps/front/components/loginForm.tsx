"use client";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { HOME_BY_ROLE } from "@/lib/config";
import { validateEmail } from "@/lib/validation";
import AuthLayout, { IconInput } from "./auth/AuthLayout";
import Button from "./shared/ui/Button";
import { FormField } from "./shared/ui/FormField";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const validate = () => {
    const next = {
      email: validateEmail(email) || undefined,
      password: password ? undefined : "Veuillez saisir votre mot de passe.",
    };
    setErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setPending(true);
    try {
      const result = await signIn("credentials", { email: email.trim(), password, redirect: false });
      if (!result || result.error) {
        // Le message vient de l'API (ex. « Email ou mot de passe incorrect. »).
        setError(result?.error && result.error !== "CredentialsSignin" ? result.error : "Email ou mot de passe incorrect.");
        return;
      }
      // Redirection vers l'espace correspondant au rôle.
      const session = await getSession();
      router.replace(session?.user.role ? HOME_BY_ROLE[session.user.role] : "/");
      router.refresh();
    } catch {
      setError("Connexion impossible, veuillez réessayer.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Connexion</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Saisissez vos identifiants pour accéder à votre espace.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField label="Adresse email" error={errors.email}>
          <IconInput
            icon={<Mail className="h-4 w-4" />}
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="prenom.nom@sagemcom.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
          />
        </FormField>

        <FormField label="Mot de passe" error={errors.password}>
          <IconInput
            icon={<Lock className="h-4 w-4" />}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </FormField>

        <Button type="submit" size="lg" loading={pending} className="w-full">
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Nouvel ouvrier ?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}
