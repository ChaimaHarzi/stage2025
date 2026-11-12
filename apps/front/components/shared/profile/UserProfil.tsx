"use client";
import { KeyRound, Pencil, ShieldCheck, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/shared/ui/Button";
import { Card, CardHeader, ErrorState, Skeleton } from "@/components/shared/ui/Card";
import { FormActions, FormField, inputClass, inputErrorClass } from "@/components/shared/ui/FormField";
import Modal from "@/components/shared/ui/Modal";
import PageHeader from "@/components/shared/ui/PageHeader";
import { useApi, useQuery } from "@/lib/api";
import { formatDate } from "@/lib/config";
import { cn } from "@/lib/utils";
import { validatePassword, validateUser, type UserForm } from "@/lib/validation";

interface Me {
  id: string;
  email: string;
  nom?: string | null;
  prenom?: string | null;
  telephone?: string | null;
  genre?: "Homme" | "Femme" | null;
  dateDeNaissance?: string | null;
  role: "ADMIN" | "OUVRIER";
  createdAt: string;
}

const QUERY = `query { me { id email nom prenom telephone genre dateDeNaissance role createdAt } }`;
const UPDATE = `mutation($input: UpdateProfileInput!) { updateProfile(input: $input) { id nom prenom } }`;
const CHANGE_PASSWORD = `mutation($input: ChangePasswordInput!) { changePassword(input: $input) }`;

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900 sm:col-span-2 sm:mt-0 dark:text-white">{value || <span className="font-normal text-slate-400">Non renseigné</span>}</dd>
    </div>
  );
}

export default function UserProfile() {
  const api = useApi();
  const { update: updateSession } = useSession();
  const { data, loading, error, refetch } = useQuery<{ me: Me }>(QUERY);
  const me = data?.me;

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<UserForm>({ nom: "", prenom: "", email: "", telephone: "", genre: "", dateDeNaissance: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwd, setPwd] = useState({ ancien: "", nouveau: "", confirmation: "" });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const header = <PageHeader title="Mon profil" subtitle="Vos informations personnelles et la sécurité de votre compte" />;

  if (error && !me)
    return (
      <>
        {header}
        <Card><ErrorState message={error} onRetry={refetch} /></Card>
      </>
    );
  if (loading && !me)
    return (
      <>
        {header}
        <Card className="space-y-4 p-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </Card>
      </>
    );
  if (!me) return null;

  const fullName = [me.prenom, me.nom].filter(Boolean).join(" ") || me.email;
  const initials = ((me.prenom?.[0] ?? "") + (me.nom?.[0] ?? "") || me.email[0]).toUpperCase();

  const openEdit = () => {
    setForm({
      nom: me.nom ?? "",
      prenom: me.prenom ?? "",
      email: me.email,
      telephone: me.telephone ?? "",
      genre: me.genre ?? "",
      dateDeNaissance: me.dateDeNaissance?.slice(0, 10) ?? "",
      password: "",
    });
    setErrors({});
    setEditOpen(true);
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateUser(form, { passwordRequired: false });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      const input = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        genre: form.genre,
        dateDeNaissance: form.dateDeNaissance,
      };
      await api(UPDATE, { input });
      await updateSession({ name: `${input.prenom} ${input.nom}` });
      toast.success("Profil mis à jour");
      setEditOpen(false);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("email")) setErrors({ email: message });
      else toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pwd.ancien) errs.ancien = "Veuillez saisir votre mot de passe actuel.";
    const p = validatePassword(pwd.nouveau);
    if (p) errs.nouveau = p;
    if (pwd.nouveau !== pwd.confirmation) errs.confirmation = "Les mots de passe ne correspondent pas.";
    setPwdErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await api(CHANGE_PASSWORD, { input: { ancienMotDePasse: pwd.ancien, nouveauMotDePasse: pwd.nouveau } });
      toast.success("Mot de passe modifié");
      setPwdOpen(false);
      setPwd({ ancien: "", nouveau: "", confirmation: "" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("actuel")) setPwdErrors({ ancien: message });
      else toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (k: keyof UserForm) => ({
    value: form[k] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value }),
    className: cn(inputClass, errors[k] && inputErrorClass),
  });

  const pwdField = (k: keyof typeof pwd) => ({
    type: "password",
    value: pwd[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPwd({ ...pwd, [k]: e.target.value }),
    className: cn(inputClass, pwdErrors[k] && inputErrorClass),
  });

  return (
    <>
      {header}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Carte d'identité */}
        <Card className="p-6 text-center lg:self-start">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-brand-600 text-2xl font-semibold text-white">
            {initials}
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{fullName}</h2>
          <p className="text-sm text-slate-500">{me.email}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {me.role === "ADMIN" ? "Administrateur" : "Ouvrier"}
          </span>
          <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
            Membre depuis le {formatDate(me.createdAt)}
          </p>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Informations personnelles"
              description="Ces informations sont visibles par les administrateurs."
              action={<Button variant="secondary" size="sm" icon={<Pencil className="h-3.5 w-3.5" />} onClick={openEdit}>Modifier</Button>}
            />
            <dl className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
              <Info label="Prénom" value={me.prenom} />
              <Info label="Nom" value={me.nom} />
              <Info label="Adresse email" value={me.email} />
              <Info label="Téléphone" value={me.telephone} />
              <Info label="Genre" value={me.genre} />
              <Info label="Date de naissance" value={me.dateDeNaissance ? formatDate(me.dateDeNaissance) : null} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Sécurité" description="Mot de passe chiffré (Argon2), session valable 8 heures." />
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Mot de passe</p>
                  <p className="text-sm text-slate-500">Changez-le régulièrement.</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => { setPwdErrors({}); setPwdOpen(true); }}>
                Changer le mot de passe
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier mon profil" icon={<UserRound className="h-5 w-5" />} size="lg">
        <form onSubmit={submitProfile} className="grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate>
          <FormField label="Prénom" required error={errors.prenom}><input {...field("prenom")} autoFocus /></FormField>
          <FormField label="Nom" required error={errors.nom}><input {...field("nom")} /></FormField>
          <FormField label="Adresse email" required error={errors.email}><input {...field("email")} type="email" /></FormField>
          <FormField label="Téléphone" required error={errors.telephone}><input {...field("telephone")} inputMode="numeric" /></FormField>
          <FormField label="Genre" required error={errors.genre}>
            <select {...field("genre")}>
              <option value="">Sélectionner…</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </FormField>
          <FormField label="Date de naissance" required error={errors.dateDeNaissance}><input {...field("dateDeNaissance")} type="date" /></FormField>
          <div className="sm:col-span-2">
            <FormActions onCancel={() => setEditOpen(false)} submitting={submitting} submitLabel="Enregistrer" />
          </div>
        </form>
      </Modal>

      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title="Changer le mot de passe" icon={<KeyRound className="h-5 w-5" />}>
        <form onSubmit={submitPassword} className="space-y-5" noValidate>
          <FormField label="Mot de passe actuel" required error={pwdErrors.ancien}><input {...pwdField("ancien")} autoComplete="current-password" autoFocus /></FormField>
          <FormField label="Nouveau mot de passe" required error={pwdErrors.nouveau} hint="8 caractères min., avec majuscule, minuscule et chiffre.">
            <input {...pwdField("nouveau")} autoComplete="new-password" />
          </FormField>
          <FormField label="Confirmation" required error={pwdErrors.confirmation}><input {...pwdField("confirmation")} autoComplete="new-password" /></FormField>
          <FormActions onCancel={() => setPwdOpen(false)} submitting={submitting} submitLabel="Mettre à jour" />
        </form>
      </Modal>
    </>
  );
}
