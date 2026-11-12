"use client";
import { Boxes, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/shared/modals/DeleteConfirmationModal";
import Button from "@/components/shared/ui/Button";
import DataTable, { Column, RowAction, selectClass } from "@/components/shared/ui/DataTable";
import { FormActions, FormField, inputClass, inputErrorClass, textareaClass } from "@/components/shared/ui/FormField";
import Modal from "@/components/shared/ui/Modal";
import PageHeader from "@/components/shared/ui/PageHeader";
import StatusBadge from "@/components/shared/ui/StatusBadge";
import { useApi, useQuery } from "@/lib/api";
import { couleur, formatDate, STATUS_INFO, type Status } from "@/lib/config";
import { cn } from "@/lib/utils";

interface Ref {
  id: string;
  nom: string;
  couleur: string;
}

interface Equipement {
  id: string;
  reference: string;
  nom: string;
  description?: string | null;
  status: Status;
  categorie: Ref;
  famille: Ref;
  createdAt: string;
  updatedAt: string;
}

const QUERY = `query {
  equipements { id reference nom description status createdAt updatedAt categorie { id nom couleur } famille { id nom couleur } }
  categories { id nom couleur }
  familles { id nom couleur }
}`;

const CREATE = `mutation($input: EquipementInput!) { createEquipement(input: $input) { id } }`;
const UPDATE = `mutation($id: ID!, $input: UpdateEquipementInput!) { updateEquipement(id: $id, input: $input) { id } }`;
const DELETE = `mutation($id: ID!) { deleteEquipement(id: $id) }`;

type FormState = { nom: string; reference: string; status: Status; familleId: string; categorieId: string; description: string };
const EMPTY_FORM: FormState = { nom: "", reference: "", status: "STOCK", familleId: "", categorieId: "", description: "" };

function validate(f: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!f.nom.trim()) errors.nom = "Le nom est requis.";
  if (!f.reference.trim()) errors.reference = "La référence est requise.";
  else if (!/^[A-Za-z0-9._-]{2,40}$/.test(f.reference.trim()))
    errors.reference = "2 à 40 caractères : lettres, chiffres, « - », « _ », « . ».";
  if (!f.familleId) errors.familleId = "Veuillez sélectionner une famille.";
  if (!f.categorieId) errors.categorieId = "Veuillez sélectionner une catégorie.";
  return errors;
}

function ClassificationTag({ value }: { value: Ref }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
      <span className={cn("h-2 w-2 rounded-full", couleur(value.couleur).dot)} />
      {value.nom}
    </span>
  );
}

export default function EquipementsManagement() {
  const api = useApi();
  const { data, loading, error, refetch } = useQuery<{ equipements: Equipement[]; categories: Ref[]; familles: Ref[] }>(QUERY);
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [categorieFilter, setCategorieFilter] = useState("");
  const [familleFilter, setFamilleFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Equipement | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [viewing, setViewing] = useState<Equipement | null>(null);
  const [toDelete, setToDelete] = useState<Equipement | null>(null);

  const all = data?.equipements ?? [];
  const rows = useMemo(
    () =>
      all.filter(
        (e) =>
          (!statusFilter || e.status === statusFilter) &&
          (!categorieFilter || e.categorie.id === categorieFilter) &&
          (!familleFilter || e.famille.id === familleFilter),
      ),
    [all, statusFilter, categorieFilter, familleFilter],
  );
  const filtersActive = !!(statusFilter || categorieFilter || familleFilter);
  const referentielVide = !!data && (data.categories.length === 0 || data.familles.length === 0);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (e: Equipement) => {
    setViewing(null);
    setEditing(e);
    setForm({
      nom: e.nom,
      reference: e.reference,
      status: e.status,
      familleId: e.famille.id,
      categorieId: e.categorie.id,
      description: e.description ?? "",
    });
    setErrors({});
    setFormOpen(true);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    const input = {
      nom: form.nom.trim(),
      reference: form.reference.trim(),
      status: form.status,
      familleId: form.familleId,
      categorieId: form.categorieId,
      description: form.description.trim() || null,
    };
    try {
      if (editing) {
        await api(UPDATE, { id: editing.id, input });
        toast.success("Équipement mis à jour", { description: input.nom });
      } else {
        await api(CREATE, { input });
        toast.success("Équipement créé", { description: `${input.reference} — ${input.nom}` });
      }
      setFormOpen(false);
      refetch();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("référence")) setErrors({ reference: message });
      else toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api(DELETE, { id: toDelete.id });
      toast.success("Équipement supprimé", { description: toDelete.nom });
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setToDelete(null);
    }
  };

  const columns: Column<Equipement>[] = [
    {
      key: "nom",
      header: "Équipement",
      value: (e) => `${e.nom} ${e.reference}`,
      render: (e) => (
        <button onClick={() => setViewing(e)} className="text-left">
          <div className="font-medium text-slate-900 hover:text-brand-600 dark:text-white">{e.nom}</div>
          <div className="font-mono text-xs text-slate-500">{e.reference}</div>
        </button>
      ),
    },
    { key: "status", header: "Statut", value: (e) => STATUS_INFO[e.status].label, render: (e) => <StatusBadge status={e.status} /> },
    { key: "categorie", header: "Catégorie", value: (e) => e.categorie.nom, render: (e) => <ClassificationTag value={e.categorie} /> },
    { key: "famille", header: "Famille", value: (e) => e.famille.nom, render: (e) => <ClassificationTag value={e.famille} /> },
    {
      key: "updatedAt",
      header: "Mis à jour",
      value: (e) => e.updatedAt,
      render: (e) => <span className="whitespace-nowrap text-slate-500 tabular">{formatDate(e.updatedAt, true)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (e) => (
        <div className="flex items-center justify-end gap-0.5">
          <RowAction title="Voir les détails" color="blue" onClick={() => setViewing(e)}>
            <Eye className="h-4 w-4" />
          </RowAction>
          <RowAction title="Modifier" color="green" onClick={() => openEdit(e)}>
            <Pencil className="h-4 w-4" />
          </RowAction>
          <RowAction title="Supprimer" color="red" onClick={() => setToDelete(e)}>
            <Trash2 className="h-4 w-4" />
          </RowAction>
        </div>
      ),
    },
  ];

  const field = (k: keyof FormState) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [k]: e.target.value });
      if (errors[k]) setErrors({ ...errors, [k]: undefined });
    },
    className: cn(inputClass, errors[k] && inputErrorClass),
  });

  return (
    <>
      <PageHeader
        title="Équipements"
        subtitle={data ? `${all.length} équipement(s) dans le parc` : "Gestion du parc matériel"}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Nouvel équipement
          </Button>
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(e) => e.id}
        loading={loading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Rechercher par nom ou référence…"
        emptyIcon={<Boxes className="h-5 w-5" />}
        emptyTitle={filtersActive ? "Aucun équipement pour ces filtres" : "Aucun équipement"}
        emptyMessage={filtersActive ? "Modifiez ou réinitialisez les filtres." : "Ajoutez votre premier équipement pour commencer le suivi."}
        emptyAction={
          filtersActive ? (
            <Button variant="secondary" onClick={() => { setStatusFilter(""); setCategorieFilter(""); setFamilleFilter(""); }}>
              Réinitialiser les filtres
            </Button>
          ) : (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Nouvel équipement</Button>
          )
        }
        toolbar={
          <>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "")} className={selectClass} aria-label="Filtrer par statut">
              <option value="">Tous les statuts</option>
              {(Object.keys(STATUS_INFO) as Status[]).map((s) => (
                <option key={s} value={s}>{STATUS_INFO[s].label}</option>
              ))}
            </select>
            <select value={categorieFilter} onChange={(e) => setCategorieFilter(e.target.value)} className={selectClass} aria-label="Filtrer par catégorie">
              <option value="">Toutes les catégories</option>
              {data?.categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            <select value={familleFilter} onChange={(e) => setFamilleFilter(e.target.value)} className={selectClass} aria-label="Filtrer par famille">
              <option value="">Toutes les familles</option>
              {data?.familles.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </>
        }
      />

      {/* Création / modification */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Modifier l'équipement" : "Nouvel équipement"}
        subtitle={editing ? editing.reference : "Les champs marqués * sont obligatoires"}
        icon={<Boxes className="h-5 w-5" />}
        size="lg"
      >
        {referentielVide && (
          <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            Créez d&apos;abord au moins une{" "}
            <Link href="/admin/categories" className="font-medium underline">catégorie</Link> et une{" "}
            <Link href="/admin/familles" className="font-medium underline">famille</Link> pour classer l&apos;équipement.
          </p>
        )}
        <form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate>
          <FormField label="Nom" required error={errors.nom} className="sm:col-span-2">
            <input {...field("nom")} placeholder="Ex. : Perceuse à percussion" autoFocus />
          </FormField>
          <FormField label="Référence (code-barres)" required error={errors.reference} hint="Valeur encodée dans le code-barres.">
            <input {...field("reference")} className={cn(field("reference").className, "font-mono")} placeholder="EQ-001" />
          </FormField>
          <FormField label="Statut" required>
            <select {...field("status")}>
              {(Object.keys(STATUS_INFO) as Status[]).map((s) => <option key={s} value={s}>{STATUS_INFO[s].label}</option>)}
            </select>
          </FormField>
          <FormField label="Catégorie" required error={errors.categorieId}>
            <select {...field("categorieId")}>
              <option value="">Sélectionner…</option>
              {data?.categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </FormField>
          <FormField label="Famille" required error={errors.familleId}>
            <select {...field("familleId")}>
              <option value="">Sélectionner…</option>
              {data?.familles.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <textarea {...field("description")} className={textareaClass} rows={3} placeholder="Caractéristiques, emplacement, remarques…" />
          </FormField>
          <div className="sm:col-span-2">
            <FormActions onCancel={() => setFormOpen(false)} submitting={submitting} submitLabel={editing ? "Enregistrer" : "Créer l'équipement"} />
          </div>
        </form>
      </Modal>

      {/* Fiche détail */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.nom ?? ""} subtitle={viewing?.reference} icon={<Boxes className="h-5 w-5" />}>
        {viewing && (
          <>
            <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {[
                ["Statut", <StatusBadge key="s" status={viewing.status} />],
                ["Référence", <span key="r" className="font-mono">{viewing.reference}</span>],
                ["Catégorie", <ClassificationTag key="c" value={viewing.categorie} />],
                ["Famille", <ClassificationTag key="f" value={viewing.famille} />],
                ["Créé le", formatDate(viewing.createdAt, true)],
                ["Dernière mise à jour", formatDate(viewing.updatedAt, true)],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right text-slate-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Description</p>
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{viewing.description || "Aucune description."}</p>
            </div>
            <div className="-mx-6 -mb-6 mt-6 flex justify-end gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60">
              <Button variant="secondary" onClick={() => setViewing(null)}>Fermer</Button>
              <Button icon={<Pencil className="h-4 w-4" />} onClick={() => openEdit(viewing)}>Modifier</Button>
            </div>
          </>
        )}
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'équipement ?"
        description={`« ${toDelete?.nom} » (${toDelete?.reference}) sera définitivement supprimé, ainsi que son historique de scans.`}
      />
    </>
  );
}
