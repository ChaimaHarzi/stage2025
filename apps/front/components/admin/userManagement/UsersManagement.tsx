"use client";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/shared/modals/DeleteConfirmationModal";
import Button from "@/components/shared/ui/Button";
import DataTable, { Column, RowAction, selectClass } from "@/components/shared/ui/DataTable";
import { FormActions, FormField, inputClass, inputErrorClass } from "@/components/shared/ui/FormField";
import Modal from "@/components/shared/ui/Modal";
import PageHeader from "@/components/shared/ui/PageHeader";
import { useApi, useQuery } from "@/lib/api";
import { formatDate } from "@/lib/config";
import { cn } from "@/lib/utils";
import { validateUser, type UserForm } from "@/lib/validation";

interface Utilisateur {
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

const QUERY = `query { utilisateurs { id email nom prenom telephone genre dateDeNaissance role createdAt } }`;
const CREATE = `mutation($input: CreateUtilisateurInput!) { createUtilisateur(input: $input) { id } }`;
const UPDATE = `mutation($id: ID!, $input: UpdateUtilisateurInput!) { updateUtilisateur(id: $id, input: $input) { id } }`;
const DELETE = `mutation($id: ID!) { deleteUtilisateur(id: $id) }`;

const EMPTY: UserForm = { nom: "", prenom: "", email: "", telephone: "", genre: "", dateDeNaissance: "", password: "", role: "OUVRIER" };

const fullName = (u: Utilisateur) => [u.prenom, u.nom].filter(Boolean).join(" ") || "—";
const initials = (u: Utilisateur) => ((u.prenom?.[0] ?? "") + (u.nom?.[0] ?? "") || u.email[0]).toUpperCase();

function RoleBadge({ role }: { role: Utilisateur["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        role === "ADMIN"
          ? "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20"
          : "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/40",
      )}
    >
      {role === "ADMIN" ? "Administrateur" : "Ouvrier"}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">{children}</p>;
}

export default function UsersManagement() {
  const api = useApi();
  const { data: session } = useSession();
  const { data, loading, error, refetch } = useQuery<{ utilisateurs: Utilisateur[] }>(QUERY);
  const [roleFilter, setRoleFilter] = useState<"" | Utilisateur["role"]>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState<Utilisateur | null>(null);

  const all = data?.utilisateurs ?? [];
  const rows = all.filter((u) => !roleFilter || u.role === roleFilter);
  const nbOuvriers = all.filter((u) => u.role === "OUVRIER").length;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (u: Utilisateur) => {
    setEditing(u);
    setForm({
      nom: u.nom ?? "",
      prenom: u.prenom ?? "",
      email: u.email,
      telephone: u.telephone ?? "",
      genre: u.genre ?? "",
      dateDeNaissance: u.dateDeNaissance?.slice(0, 10) ?? "",
      password: "",
      role: u.role,
    });
    setErrors({});
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateUser(form, { passwordRequired: !editing });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    const input: Record<string, unknown> = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
      genre: form.genre,
      dateDeNaissance: form.dateDeNaissance,
      role: form.role,
    };
    if (form.password) input.password = form.password;
    try {
      if (editing) {
        await api(UPDATE, { id: editing.id, input });
        toast.success("Compte mis à jour", { description: `${input.prenom} ${input.nom}` });
      } else {
        await api(CREATE, { input });
        toast.success("Compte créé", { description: `${input.prenom} ${input.nom} peut maintenant se connecter.` });
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("email")) setErrors({ email: message });
      else toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api(DELETE, { id: toDelete.id });
      toast.success("Compte supprimé", { description: fullName(toDelete) });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setToDelete(null);
    }
  };

  const columns: Column<Utilisateur>[] = [
    {
      key: "nom",
      header: "Utilisateur",
      value: (u) => `${fullName(u)} ${u.email}`,
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            {initials(u)}
          </span>
          <div className="min-w-0">
            <div className="truncate font-medium text-slate-900 dark:text-white">
              {fullName(u)}
              {u.id === session?.user.id && <span className="ml-2 text-xs font-normal text-slate-400">(vous)</span>}
            </div>
            <div className="truncate text-xs text-slate-500">{u.email}</div>
          </div>
        </div>
      ),
    },
    { key: "telephone", header: "Téléphone", value: (u) => u.telephone ?? "", render: (u) => <span className="tabular">{u.telephone || "—"}</span> },
    { key: "role", header: "Rôle", value: (u) => u.role, render: (u) => <RoleBadge role={u.role} /> },
    { key: "createdAt", header: "Inscrit le", value: (u) => u.createdAt, render: (u) => <span className="text-slate-500 tabular">{formatDate(u.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-0.5">
          <RowAction title="Modifier" color="green" onClick={() => openEdit(u)}>
            <Pencil className="h-4 w-4" />
          </RowAction>
          {u.id !== session?.user.id && (
            <RowAction title="Supprimer" color="red" onClick={() => setToDelete(u)}>
              <Trash2 className="h-4 w-4" />
            </RowAction>
          )}
        </div>
      ),
    },
  ];

  const field = (k: keyof UserForm) => ({
    value: form[k] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [k]: e.target.value });
      if (errors[k]) setErrors({ ...errors, [k]: undefined });
    },
    className: cn(inputClass, errors[k] && inputErrorClass),
  });

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        subtitle={data ? `${all.length} compte(s) dont ${nbOuvriers} ouvrier(s)` : "Gestion des comptes et des accès"}
        actions={
          <Button icon={<UserPlus className="h-4 w-4" />} onClick={openCreate}>
            Nouveau compte
          </Button>
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(u) => u.id}
        loading={loading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Rechercher par nom, email, téléphone…"
        emptyIcon={<Users className="h-5 w-5" />}
        emptyTitle="Aucun compte"
        toolbar={
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className={selectClass} aria-label="Filtrer par rôle">
            <option value="">Tous les rôles</option>
            <option value="OUVRIER">Ouvriers</option>
            <option value="ADMIN">Administrateurs</option>
          </select>
        }
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Modifier le compte" : "Nouveau compte"}
        subtitle={editing ? editing.email : "Le compte pourra se connecter immédiatement"}
        icon={<UserPlus className="h-5 w-5" />}
        size="lg"
      >
        <form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate>
          <SectionTitle>Identité</SectionTitle>
          <FormField label="Prénom" required error={errors.prenom}>
            <input {...field("prenom")} autoFocus />
          </FormField>
          <FormField label="Nom" required error={errors.nom}>
            <input {...field("nom")} />
          </FormField>
          <FormField label="Genre" required error={errors.genre}>
            <select {...field("genre")}>
              <option value="">Sélectionner…</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </FormField>
          <FormField label="Date de naissance" required error={errors.dateDeNaissance}>
            <input {...field("dateDeNaissance")} type="date" />
          </FormField>

          <div className="h-px bg-slate-100 sm:col-span-2 dark:bg-slate-800" />
          <SectionTitle>Contact et accès</SectionTitle>
          <FormField label="Adresse email" required error={errors.email}>
            <input {...field("email")} type="email" />
          </FormField>
          <FormField label="Téléphone" required error={errors.telephone}>
            <input {...field("telephone")} inputMode="numeric" />
          </FormField>
          <FormField label="Rôle" required hint={editing?.id === session?.user.id ? "Vous ne pouvez pas modifier votre propre rôle." : undefined}>
            <select {...field("role")} disabled={editing?.id === session?.user.id}>
              <option value="OUVRIER">Ouvrier</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </FormField>
          <FormField
            label={editing ? "Nouveau mot de passe" : "Mot de passe"}
            required={!editing}
            error={errors.password}
            hint={editing ? "Laisser vide pour conserver le mot de passe actuel." : "8 caractères min., avec majuscule, minuscule et chiffre."}
          >
            <input {...field("password")} type="password" autoComplete="new-password" />
          </FormField>

          <div className="sm:col-span-2">
            <FormActions onCancel={() => setFormOpen(false)} submitting={submitting} submitLabel={editing ? "Enregistrer" : "Créer le compte"} />
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer ce compte ?"
        description={`Le compte de ${toDelete ? fullName(toDelete) : ""} (${toDelete?.email}) sera supprimé et sa session fermée immédiatement.`}
      />
    </>
  );
}
