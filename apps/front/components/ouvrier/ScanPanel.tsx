"use client";
import { AlertCircle, ArrowRight, CheckCircle2, History, ScanLine } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/shared/ui/Button";
import { Card, CardHeader, EmptyState } from "@/components/shared/ui/Card";
import StatusBadge from "@/components/shared/ui/StatusBadge";
import { useApi } from "@/lib/api";
import { STATUS_INFO, STATUS_PAR_SCANS, type Status } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Délai pendant lequel les lectures du même code sont regroupées. */
const SCAN_WINDOW_MS = 2500;
const MAX_SCANS = 3;

const SCAN_MUTATION = `mutation($input: ScanInput!) {
  scanEquipement(input: $input) { equipement { reference nom } ancienStatus nouveauStatus nombreScans }
}`;

interface Pending {
  code: string;
  count: number;
  deadline: number;
}

interface Feedback {
  id: number;
  ok: boolean;
  message: string;
  reference: string;
  nom?: string;
  ancien?: Status;
  nouveau?: Status;
  at: Date;
}

/**
 * Poste de scan de l'ouvrier.
 * Un lecteur de code-barres USB « tape » le code suivi de Entrée dans le champ.
 * Les lectures successives d'un même code pendant 2,5 s sont comptées, puis le
 * nombre est envoyé à l'API : 1 → production, 2 → stock, 3 → réparation.
 */
export default function ScanPanel({ onScanned }: { onScanned: () => void }) {
  const api = useApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [sending, setSending] = useState(false);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [history, setHistory] = useState<Feedback[]>([]);

  const updatePending = (p: Pending | null) => {
    pendingRef.current = p;
    setPending(p);
  };

  const send = useCallback(
    async (p: Pending) => {
      const id = Date.now() + Math.random();
      setSending(true);
      try {
        const { scanEquipement: r } = await api<{
          scanEquipement: { equipement: { reference: string; nom: string }; ancienStatus: Status; nouveauStatus: Status };
        }>(SCAN_MUTATION, { input: { reference: p.code, nombreScans: p.count } });
        setHistory((h) => [
          { id, ok: true, reference: r.equipement.reference, nom: r.equipement.nom, ancien: r.ancienStatus, nouveau: r.nouveauStatus, message: "", at: new Date() },
          ...h.slice(0, 7),
        ]);
        onScanned();
      } catch (e) {
        setHistory((h) => [{ id, ok: false, reference: p.code, message: e instanceof Error ? e.message : String(e), at: new Date() }, ...h.slice(0, 7)]);
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [api, onScanned],
  );

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const p = pendingRef.current;
    updatePending(null);
    if (p) void send(p);
  }, [send]);

  const registerScan = (raw: string) => {
    const code = raw.trim();
    if (!code) return;
    if (pendingRef.current && pendingRef.current.code !== code) flush(); // autre équipement : on valide le précédent
    const next: Pending = { code, count: (pendingRef.current?.count ?? 0) + 1, deadline: Date.now() + SCAN_WINDOW_MS };
    updatePending(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (next.count >= MAX_SCANS) flush();
    else timerRef.current = setTimeout(flush, SCAN_WINDOW_MS);
  };

  // Compte à rebours visuel pendant le regroupement des lectures.
  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, [pending]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const remaining = pending ? Math.max(0, pending.deadline - now) : 0;
  const last = history[0];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Poste de scan */}
      <Card className="overflow-hidden xl:col-span-3">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <ScanLine className="h-5 w-5 text-sky-300" />
              </span>
              <div>
                <h2 className="font-semibold">Poste de scan</h2>
                <p className="text-sm text-slate-400">Scannez le code-barres d&apos;un équipement</p>
              </div>
            </div>
            <span
              className={cn(
                "hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex",
                focused ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", focused ? "bg-emerald-400" : "bg-amber-400")} />
              {focused ? "Prêt à scanner" : "Cliquez dans le champ"}
            </span>
          </div>

          <form
            className="mt-5"
            onSubmit={(e) => {
              e.preventDefault();
              registerScan(value);
              setValue("");
            }}
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder="En attente de lecture…"
              aria-label="Code-barres"
              className="h-14 w-full rounded-lg border border-white/15 bg-white/5 px-4 font-mono text-lg tracking-wider text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-400/20"
            />
          </form>
        </div>

        <div className="p-6">
          {/* Règle des scans */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((n) => {
              const s = STATUS_PAR_SCANS[n];
              const active = pending?.count === n;
              return (
                <div
                  key={n}
                  className={cn(
                    "rounded-lg border p-4 text-center transition-all",
                    active
                      ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/15 dark:bg-brand-500/10"
                      : "border-slate-200 dark:border-slate-800",
                  )}
                >
                  <div className="flex justify-center gap-1" aria-hidden>
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} className={cn("h-1.5 w-4 rounded-full", active ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600")} />
                    ))}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {n} scan{n > 1 ? "s" : ""}
                  </div>
                  <div className={cn("mt-0.5 text-xs font-medium", STATUS_INFO[s].text)}>{STATUS_INFO[s].label}</div>
                </div>
              );
            })}
          </div>

          {/* État courant */}
          <div className="mt-5 min-h-[76px]" aria-live="polite">
            {pending ? (
              <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-slate-700 dark:text-slate-300">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{pending.code}</span> · {pending.count} lecture(s) →{" "}
                    <strong className={STATUS_INFO[STATUS_PAR_SCANS[pending.count]].text}>{STATUS_INFO[STATUS_PAR_SCANS[pending.count]].label}</strong>
                  </span>
                  <Button size="sm" onClick={flush}>Valider maintenant</Button>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-500/20">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${(remaining / SCAN_WINDOW_MS) * 100}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">Scannez à nouveau le même code pour changer le statut visé.</p>
              </div>
            ) : sending ? (
              <p className="py-6 text-center text-sm text-slate-500">Enregistrement…</p>
            ) : last ? (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-sm",
                  last.ok
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                    : "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10",
                )}
              >
                {last.ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />}
                {last.ok && last.ancien && last.nouveau ? (
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {last.nom} <span className="font-mono text-xs font-normal text-slate-500">{last.reference}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <StatusBadge status={last.ancien} /> <ArrowRight className="h-3.5 w-3.5 text-slate-400" /> <StatusBadge status={last.nouveau} />
                    </span>
                  </div>
                ) : (
                  <span className="text-red-700 dark:text-red-300">{last.message}</span>
                )}
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">
                Sans lecteur : saisissez la référence puis appuyez sur Entrée 1, 2 ou 3 fois de suite.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Historique de la session */}
      <Card className="xl:col-span-2">
        <CardHeader title="Scans de la session" description="Les 8 derniers scans effectués sur ce poste" />
        {history.length === 0 ? (
          <EmptyState icon={<History className="h-5 w-5" />} title="Aucun scan pour l'instant" description="Vos scans apparaîtront ici." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((f) => (
              <li key={f.id} className="flex gap-3 px-5 py-3">
                {f.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-900 dark:text-white">{f.nom ?? f.reference}</span>
                    <span className="shrink-0 text-xs text-slate-400 tabular">{f.at.toLocaleTimeString("fr-FR")}</span>
                  </div>
                  {f.ok && f.nouveau ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-500">{f.reference}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <StatusBadge status={f.nouveau} />
                    </div>
                  ) : (
                    <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{f.message}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
