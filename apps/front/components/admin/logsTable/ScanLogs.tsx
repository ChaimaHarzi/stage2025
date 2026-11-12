"use client";
import { ArrowRight, Cpu, MonitorSmartphone, RefreshCw, ScanLine } from "lucide-react";
import React, { useState } from "react";
import Button from "@/components/shared/ui/Button";
import DataTable, { Column, selectClass } from "@/components/shared/ui/DataTable";
import PageHeader from "@/components/shared/ui/PageHeader";
import StatusBadge from "@/components/shared/ui/StatusBadge";
import { useQuery } from "@/lib/api";
import { formatDate, STATUS_INFO, type Status } from "@/lib/config";

export interface ScanLog {
  id: string;
  equipement: { id: string; reference: string; nom: string };
  utilisateur?: { id: string; email: string; nom?: string | null; prenom?: string | null } | null;
  source: "WEB" | "RASPBERRY";
  nombreScans: number;
  ancienStatus: Status;
  nouveauStatus: Status;
  createdAt: string;
}

export const SCAN_LOG_FIELDS = `id source nombreScans ancienStatus nouveauStatus createdAt
  equipement { id reference nom } utilisateur { id email nom prenom }`;

const QUERY = `query($filter: ScanLogsFilter) { scanLogs(filter: $filter) { ${SCAN_LOG_FIELDS} } }`;

export const auteurScan = (log: ScanLog) =>
  log.source === "RASPBERRY"
    ? "Système embarqué"
    : log.utilisateur
      ? [log.utilisateur.prenom, log.utilisateur.nom].filter(Boolean).join(" ") || log.utilisateur.email
      : "Compte supprimé";

export function SourceTag({ source }: { source: ScanLog["source"] }) {
  return (
    <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
      {source === "RASPBERRY" ? <Cpu className="h-3.5 w-3.5" /> : <MonitorSmartphone className="h-3.5 w-3.5" />}
      {source === "RASPBERRY" ? "Raspberry Pi" : "Interface web"}
    </span>
  );
}

export default function ScanLogs() {
  const [limit, setLimit] = useState(200);
  const [source, setSource] = useState<"" | ScanLog["source"]>("");
  const { data, loading, error, refetch } = useQuery<{ scanLogs: ScanLog[] }>(QUERY, {
    filter: { limit, ...(source ? { source } : {}) },
  });

  const columns: Column<ScanLog>[] = [
    {
      key: "date",
      header: "Date",
      value: (l) => l.createdAt,
      render: (l) => <span className="whitespace-nowrap text-slate-500 tabular">{formatDate(l.createdAt, true)}</span>,
    },
    {
      key: "equipement",
      header: "Équipement",
      value: (l) => `${l.equipement.reference} ${l.equipement.nom}`,
      render: (l) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{l.equipement.nom}</div>
          <div className="font-mono text-xs text-slate-500">{l.equipement.reference}</div>
        </div>
      ),
    },
    {
      key: "scans",
      header: "Scans",
      value: (l) => l.nombreScans,
      render: (l) => (
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-1.5 text-xs font-semibold text-slate-700 tabular dark:bg-slate-800 dark:text-slate-300">
          {l.nombreScans}×
        </span>
      ),
    },
    {
      key: "transition",
      header: "Changement de statut",
      value: (l) => `${STATUS_INFO[l.ancienStatus].label} ${STATUS_INFO[l.nouveauStatus].label}`,
      render: (l) => (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={l.ancienStatus} />
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <StatusBadge status={l.nouveauStatus} />
        </div>
      ),
    },
    {
      key: "auteur",
      header: "Par",
      value: auteurScan,
      render: (l) => (
        <div>
          <div>{auteurScan(l)}</div>
          <SourceTag source={l.source} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Journal des scans"
        subtitle="Historique des scans et des changements de statut des équipements"
        actions={
          <Button variant="secondary" icon={<RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />} onClick={refetch}>
            Actualiser
          </Button>
        }
      />
      <DataTable
        rows={data?.scanLogs ?? []}
        columns={columns}
        rowKey={(l) => l.id}
        loading={loading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Rechercher un équipement, un ouvrier…"
        emptyIcon={<ScanLine className="h-5 w-5" />}
        emptyTitle="Aucun scan enregistré"
        emptyMessage="Les scans effectués par les ouvriers et le système embarqué apparaîtront ici."
        toolbar={
          <>
            <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className={selectClass} aria-label="Filtrer par source">
              <option value="">Toutes les sources</option>
              <option value="WEB">Interface web</option>
              <option value="RASPBERRY">Raspberry Pi</option>
            </select>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={selectClass} aria-label="Nombre de scans chargés">
              {[50, 100, 200, 500].map((n) => (
                <option key={n} value={n}>
                  {n} derniers
                </option>
              ))}
            </select>
          </>
        }
      />
    </>
  );
}
