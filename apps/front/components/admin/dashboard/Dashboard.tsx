"use client";
import type { ApexOptions } from "apexcharts";
import { ArrowRight, Boxes, Factory, Inbox, RefreshCw, ScanLine, Users, Warehouse, Wrench } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, EmptyState, ErrorState, Skeleton } from "@/components/shared/ui/Card";
import PageHeader from "@/components/shared/ui/PageHeader";
import StatusBadge from "@/components/shared/ui/StatusBadge";
import { useQuery } from "@/lib/api";
import { couleur, formatDate, STATUS_INFO, type Status } from "@/lib/config";
import { cn } from "@/lib/utils";
import { auteurScan, SCAN_LOG_FIELDS, type ScanLog, SourceTag } from "../logsTable/ScanLogs";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Repartition {
  nom: string;
  couleur: string;
  total: number;
}

interface Stats {
  totalEquipements: number;
  enStock: number;
  enProduction: number;
  enReparation: number;
  totalCategories: number;
  totalFamilles: number;
  totalOuvriers: number;
  scansAujourdhui: number;
  parCategorie: Repartition[];
  parFamille: Repartition[];
  derniersScans: ScanLog[];
}

const QUERY = `query { dashboardStats {
  totalEquipements enStock enProduction enReparation totalCategories totalFamilles totalOuvriers scansAujourdhui
  parCategorie { nom couleur total } parFamille { nom couleur total }
  derniersScans { ${SCAN_LOG_FIELDS} }
} }`;

/** Intervalle de rafraîchissement automatique (suivi en temps réel). */
const REFRESH_MS = 15_000;

function Kpi({
  label,
  value,
  icon,
  tone,
  footer,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular dark:text-white">{value}</p>
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tone)}>{icon}</span>
      </div>
      {footer && <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">{footer}</div>}
    </Card>
  );
}

function StatusKpi({ status, value, total, icon }: { status: Status; value: number; total: number; icon: React.ReactNode }) {
  const info = STATUS_INFO[status];
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <Kpi
      label={info.label}
      value={value}
      icon={icon}
      tone={cn(info.soft, info.text)}
      footer={
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={cn("h-full rounded-full transition-all", info.dot)} style={{ width: `${pct}%` }} />
          </div>
          <span className="font-medium tabular">{pct} %</span>
        </div>
      }
    />
  );
}

function RepartitionList({ rows, empty }: { rows: Repartition[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  if (rows.length === 0) return <EmptyState icon={<Inbox className="h-5 w-5" />} title={empty} className="py-10" />;
  return (
    <ul className="space-y-4 p-5">
      {rows.slice(0, 6).map((r) => (
        <li key={r.nom}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className={cn("h-2 w-2 rounded-full", couleur(r.couleur).dot)} />
              {r.nom}
            </span>
            <span className="font-medium text-slate-900 tabular dark:text-white">{r.total}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={cn("h-full rounded-full", couleur(r.couleur).dot)} style={{ width: `${(r.total / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2 w-full" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="h-72 p-5">
            <Skeleton className="h-full w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refetch } = useQuery<{ dashboardStats: Stats }>(QUERY);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(refetch, REFRESH_MS);
    return () => clearInterval(id);
  }, [refetch]);

  useEffect(() => {
    if (data) setUpdatedAt(new Date());
  }, [data]);

  const header = (
    <PageHeader
      title="Tableau de bord"
      subtitle="Vue d'ensemble de l'état du parc matériel"
      actions={
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 transition-colors hover:bg-white hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
          title="Actualiser"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {updatedAt ? `Mis à jour à ${updatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Temps réel"}
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </button>
      }
    />
  );

  if (error && !data)
    return (
      <>
        {header}
        <Card>
          <ErrorState message={error} onRetry={refetch} />
        </Card>
      </>
    );
  if (!data)
    return (
      <>
        {header}
        <DashboardSkeleton />
      </>
    );

  const s = data.dashboardStats;

  const donut: ApexOptions = {
    labels: [STATUS_INFO.PROD.label, STATUS_INFO.STOCK.label, STATUS_INFO.REP.label],
    colors: [STATUS_INFO.PROD.hex, STATUS_INFO.STOCK.hex, STATUS_INFO.REP.hex],
    legend: {
      position: "bottom",
      fontSize: "13px",
      fontFamily: "inherit",
      labels: { colors: "#64748b" },
      markers: { size: 5, offsetX: -4 },
      itemMargin: { horizontal: 10, vertical: 4 },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ["transparent"] },
    tooltip: { y: { formatter: (v: number) => `${v} équipement(s)` } },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            value: { fontSize: "28px", fontWeight: 600, color: "#64748b" },
            total: { show: true, label: "Équipements", fontSize: "13px", color: "#64748b" },
          },
        },
      },
    },
    chart: { fontFamily: "inherit" },
  };

  return (
    <>
      {header}
      <div className="space-y-6">
        {/* Indicateurs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="Équipements"
            value={s.totalEquipements}
            icon={<Boxes className="h-5 w-5" />}
            tone="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
            footer={`${s.totalCategories} catégorie(s) · ${s.totalFamilles} famille(s)`}
          />
          <StatusKpi status="PROD" value={s.enProduction} total={s.totalEquipements} icon={<Factory className="h-5 w-5" />} />
          <StatusKpi status="STOCK" value={s.enStock} total={s.totalEquipements} icon={<Warehouse className="h-5 w-5" />} />
          <StatusKpi status="REP" value={s.enReparation} total={s.totalEquipements} icon={<Wrench className="h-5 w-5" />} />
        </div>

        {/* Répartitions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader title="Répartition par statut" description="État actuel du parc" />
            {s.totalEquipements === 0 ? (
              <EmptyState icon={<Boxes className="h-5 w-5" />} title="Aucun équipement" className="py-10" />
            ) : (
              <div className="p-3">
                <Chart type="donut" height={280} options={donut} series={[s.enProduction, s.enStock, s.enReparation]} />
              </div>
            )}
          </Card>
          <Card>
            <CardHeader title="Par catégorie" description="Nombre d'équipements" />
            <RepartitionList rows={s.parCategorie} empty="Aucune catégorie" />
          </Card>
          <Card>
            <CardHeader title="Par famille" description="Nombre d'équipements" />
            <RepartitionList rows={s.parFamille} empty="Aucune famille" />
          </Card>
        </div>

        {/* Activité */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="grid grid-cols-1 content-start gap-4 self-start sm:grid-cols-2 xl:grid-cols-1">
            <Kpi label="Scans aujourd'hui" value={s.scansAujourdhui} icon={<ScanLine className="h-5 w-5" />} tone="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
            <Kpi label="Ouvriers inscrits" value={s.totalOuvriers} icon={<Users className="h-5 w-5" />} tone="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" />
          </div>
          <Card className="overflow-hidden xl:col-span-3">
            <CardHeader
              title="Derniers scans"
              description="Changements de statut les plus récents"
              action={
                <Link href="/admin/logs" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  Voir le journal <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
            {s.derniersScans.length === 0 ? (
              <EmptyState icon={<ScanLine className="h-5 w-5" />} title="Aucun scan pour le moment" description="Les scans des ouvriers apparaîtront ici." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-2.5 font-medium">Équipement</th>
                      <th className="px-5 py-2.5 font-medium">Nouveau statut</th>
                      <th className="px-5 py-2.5 font-medium">Par</th>
                      <th className="px-5 py-2.5 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {s.derniersScans.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-3">
                          <div className="font-medium text-slate-900 dark:text-white">{l.equipement.nom}</div>
                          <div className="font-mono text-xs text-slate-500">{l.equipement.reference}</div>
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={l.nouveauStatus} /></td>
                        <td className="px-5 py-3">
                          <div className="text-slate-700 dark:text-slate-300">{auteurScan(l)}</div>
                          <SourceTag source={l.source} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-slate-500 tabular">{formatDate(l.createdAt, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
