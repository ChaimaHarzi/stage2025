"use client";
/**
 * Gestion des catégories (sprint 3) et des familles (sprint 4).
 * Les deux écrans sont identiques ; seuls les libellés et les opérations GraphQL changent.
 */
import { FolderTree, LayoutGrid, List, Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/shared/modals/DeleteConfirmationModal";
import Button from "@/components/shared/ui/Button";
import { Card, EmptyState, ErrorState, Skeleton } from "@/components/shared/ui/Card";
import { FormActions, FormField, inputClass, inputErrorClass, textareaClass } from "@/components/shared/ui/FormField";
import Modal from "@/components/shared/ui/Modal";
import PageHeader from "@/components/shared/ui/PageHeader";
import { useApi, useQuery } from "@/lib/api";
import { COULEURS, couleur, type Couleur } from "@/lib/config";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  nom: string;
  description?: string | null;
  couleur: string;
  nombreEquipements: number;
}

const CONFIG = {
  categorie: {
    titre: "Catégories",
    sousTitre: "Classez les équipements par type d'usage.",
    singulier: "catégorie",
    nouvelle: "Nouvelle catégorie",
    modifier: "Modifier la catégorie",
    Icon: Tags,
    list: "categories",
    create: "createCategorie",
    update: "updateCategorie",
    remove: "deleteCategorie",
  },
  famille: {
    titre: "Familles",
    sousTitre: "Regroupez les équipements par famille de produits.",
    singulier: "famille",
    nouvelle: "Nouvelle famille",
    modifier: "Modifier la famille",
    Icon: FolderTree,
    list: "familles",
    create: "createFamille",
    update: "updateFamille",
    remove: "deleteFamille",
  },
} as const;

const FIELDS = "id nom description couleur nombreEquipements";

export default function ClassificationCards({ kind }: { kind: keyof typeof CONFIG }) {
  const cfg = CONFIG[kind];
  const api = useApi();
  const { data, loading, error, refetch } = useQuery<Record<string, Item[]>>(`query { ${cfg.list} { ${FIELDS} } }`);
  const items = data?.[cfg.list] ?? [];

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ nom: "", description: "", couleur: "blue" as Couleur });
  const [nomError, setNomError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toDelete, setToDelete] = useState<Item | null>(null);

  const q = searchTerm.trim().toLowerCase();
  const filtered = items.filter((i) => i.nom.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
  const totalEquipements = items.reduce((n, i) => n + i.nombreEquipements, 0);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: "", description: "", couleur: "blue" });
    setNomError("");
    setFormOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setForm({ nom: item.nom, description: item.description ?? "", couleur: (item.couleur as Couleur) ?? "blue" });
    setNomError("");
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      setNomError("Veuillez saisir le nom.");
      return;
    }
    setSubmitting(true);
    const input = { nom: form.nom.trim(), description: form.description.trim() || null, couleur: form.couleur };
    try {
      if (editing) {
        await api(`mutation($id: ID!, $input: UpdateClassificationInput!) { ${cfg.update}(id: $id, input: $input) { id } }`, { id: editing.id, input });
        toast.success(`${cfg.singulier[0].toUpperCase()}${cfg.singulier.slice(1)} mise à jour`, { description: input.nom });
      } else {
        await api(`mutation($input: ClassificationInput!) { ${cfg.create}(input: $input) { id } }`, { input });
        toast.success(`${cfg.singulier[0].toUpperCase()}${cfg.singulier.slice(1)} créée`, { description: input.nom });
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Nom déjà existant : on reste sur le formulaire (scénario alternatif 1a/3a).
      if (message.includes("existe déjà")) setNomError(message);
      else toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await api(`mutation($id: ID!) { ${cfg.remove}(id: $id) }`, { id: toDelete.id });
      toast.success(`${cfg.singulier[0].toUpperCase()}${cfg.singulier.slice(1)} supprimée`, { description: toDelete.nom });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setToDelete(null);
    }
  };

  const Actions = ({ item }: { item: Item }) => (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => openEdit(item)}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
        title="Modifier"
        aria-label={`Modifier ${item.nom}`}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => setToDelete(item)}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        title="Supprimer"
        aria-label={`Supprimer ${item.nom}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const CountBadge = ({ item }: { item: Item }) => (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 tabular dark:bg-slate-800 dark:text-slate-300">
      {item.nombreEquipements} équipement{item.nombreEquipements > 1 ? "s" : ""}
    </span>
  );

  return (
    <>
      <PageHeader
        title={cfg.titre}
        subtitle={data ? `${items.length} ${cfg.singulier}(s) · ${totalEquipements} équipement(s) classé(s)` : cfg.sousTitre}
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            {cfg.nouvelle}
          </Button>
        }
      />

      {/* Barre d'outils */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(inputClass, "h-9 pl-9")}
          />
        </div>
        <div className="inline-flex self-start rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs dark:border-slate-700 dark:bg-slate-900">
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                viewMode === mode ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
              )}
              aria-pressed={viewMode === mode}
            >
              {mode === "grid" ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
              {mode === "grid" ? "Grille" : "Liste"}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="space-y-3 p-5">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      ) : error && !data ? (
        <Card>
          <ErrorState message={error} onRetry={refetch} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          {searchTerm ? (
            <EmptyState icon={<Search className="h-5 w-5" />} title="Aucun résultat" description={`Rien ne correspond à « ${searchTerm} ».`} />
          ) : (
            <EmptyState
              icon={<cfg.Icon className="h-5 w-5" />}
              title={`Aucune ${cfg.singulier} pour le moment`}
              description={cfg.sousTitre}
              action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>{cfg.nouvelle}</Button>}
            />
          )}
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const c = couleur(item.couleur);
            return (
              <Card key={item.id} className="group flex flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.light)}>
                    <cfg.Icon className={cn("h-5 w-5", c.text)} />
                  </span>
                  <Actions item={item} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{item.nom}</h3>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500 dark:text-slate-400">{item.description || "Aucune description."}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <CountBadge item={item} />
                  {item.nombreEquipements > 0 && (
                    <Link href="/admin/equipements" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                      Voir les équipements →
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((item) => {
            const c = couleur(item.couleur);
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", c.light)}>
                  <cfg.Icon className={cn("h-4 w-4", c.text)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{item.nom}</p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{item.description || "Aucune description."}</p>
                </div>
                <CountBadge item={item} />
                <Actions item={item} />
              </div>
            );
          })}
        </Card>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? cfg.modifier : cfg.nouvelle} icon={<cfg.Icon className="h-5 w-5" />}>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <FormField label="Nom" required error={nomError}>
            <input
              value={form.nom}
              onChange={(e) => {
                setForm({ ...form, nom: e.target.value });
                setNomError("");
              }}
              className={cn(inputClass, nomError && inputErrorClass)}
              placeholder={`Nom de la ${cfg.singulier}`}
              autoFocus
            />
          </FormField>
          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={textareaClass}
              rows={3}
              placeholder="Description facultative"
            />
          </FormField>
          <FormField label="Couleur" hint="Utilisée pour repérer la classification dans les listes et graphiques.">
            <div className="flex gap-2.5">
              {(Object.keys(COULEURS) as Couleur[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  aria-pressed={form.couleur === name}
                  onClick={() => setForm({ ...form, couleur: name })}
                  className={cn(
                    "h-7 w-7 rounded-full ring-offset-2 transition-transform hover:scale-110 dark:ring-offset-slate-900",
                    COULEURS[name].dot,
                    form.couleur === name && "ring-2 ring-slate-400",
                  )}
                />
              ))}
            </div>
          </FormField>
          <FormActions onCancel={() => setFormOpen(false)} submitting={submitting} submitLabel={editing ? "Enregistrer" : "Créer"} />
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={`Supprimer la ${cfg.singulier} ?`}
        description={
          toDelete && toDelete.nombreEquipements > 0
            ? `« ${toDelete.nom} » contient ${toDelete.nombreEquipements} équipement(s) : la suppression sera refusée tant qu'ils n'auront pas été réaffectés.`
            : `« ${toDelete?.nom} » sera définitivement supprimée.`
        }
      />
    </>
  );
}
