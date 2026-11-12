"use client";
import { Boxes } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import ScanPanel from "@/components/ouvrier/ScanPanel";
import DataTable, { Column } from "@/components/shared/ui/DataTable";
import PageHeader from "@/components/shared/ui/PageHeader";
import StatusBadge from "@/components/shared/ui/StatusBadge";
import { useQuery } from "@/lib/api";
import { formatDate, STATUS_INFO, type Status } from "@/lib/config";
import { cn } from "@/lib/utils";

interface EquipementOuvrier {
  id: string;
  reference: string;
  nom: string;
  status: Status;
  updatedAt: string;
}

const QUERY = `query { equipementsOuvrier { id reference nom status updatedAt } }`;

/** Interface ouvrier : poste de scan + liste simplifiée des équipements (nom et statut). */
export default function OuvrierPage() {
  const { data, loading, error, refetch } = useQuery<{ equipementsOuvrier: EquipementOuvrier[] }>(QUERY);
  const [statusFilter, setStatusFilter] = useState<Status | "">("");

  // Rafraîchissement régulier pour voir les scans faits depuis d'autres postes.
  useEffect(() => {
    const id = setInterval(refetch, 15_000);
    return () => clearInterval(id);
  }, [refetch]);

  const all = data?.equipementsOuvrier ?? [];
  const rows = useMemo(() => all.filter((e) => !statusFilter || e.status === statusFilter), [all, statusFilter]);
  const counts = useMemo(
    () => all.reduce((acc, e) => ({ ...acc, [e.status]: (acc[e.status] ?? 0) + 1 }), {} as Partial<Record<Status, number>>),
    [all],
  );

  const columns: Column<EquipementOuvrier>[] = [
    {
      key: "nom",
      header: "Équipement",
      value: (e) => `${e.nom} ${e.reference}`,
      render: (e) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{e.nom}</div>
          <div className="font-mono text-xs text-slate-500">{e.reference}</div>
        </div>
      ),
    },
    { key: "status", header: "Statut", value: (e) => STATUS_INFO[e.status].label, render: (e) => <StatusBadge status={e.status} /> },
    {
      key: "updatedAt",
      header: "Dernier changement",
      align: "right",
      value: (e) => e.updatedAt,
      render: (e) => <span className="whitespace-nowrap text-slate-500 tabular">{formatDate(e.updatedAt, true)}</span>,
    },
  ];

  const tabs: { value: Status | ""; label: string; count: number }[] = [
    { value: "", label: "Tous", count: all.length },
    ...(Object.keys(STATUS_INFO) as Status[]).map((s) => ({ value: s, label: STATUS_INFO[s].label, count: counts[s] ?? 0 })),
  ];

  return (
    <>
      <PageHeader title="Scan & équipements" subtitle="Changez le statut d'un équipement en scannant son code-barres." />

      <ScanPanel onScanned={refetch} />

      <div className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">État des équipements</h2>
          <div className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-700 dark:bg-slate-900" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.label}
                role="tab"
                aria-selected={statusFilter === t.value}
                onClick={() => setStatusFilter(t.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  statusFilter === t.value
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                {t.value && <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_INFO[t.value].dot)} />}
                {t.label}
                <span className="text-xs opacity-70 tabular">{t.count}</span>
              </button>
            ))}
          </div>
        </div>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(e) => e.id}
          loading={loading}
          error={error}
          onRetry={refetch}
          searchPlaceholder="Rechercher un équipement…"
          emptyIcon={<Boxes className="h-5 w-5" />}
          emptyTitle="Aucun équipement"
        />
      </div>
    </>
  );
}
