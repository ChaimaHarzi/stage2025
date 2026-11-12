"use client";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Inbox, Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, EmptyState, ErrorState, Skeleton } from "./Card";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Valeur utilisée pour le tri et la recherche ; sans elle, la colonne n'est pas triable. */
  value?: (row: T) => string | number;
  className?: string;
  /** Alignement de la colonne (actions à droite, nombres à droite…). */
  align?: "left" | "right";
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  /** Filtres affichés à droite de la recherche. */
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  emptyIcon?: React.ReactNode;
}

const PAGE_SIZES = [10, 25, 50, 100];

export const selectClass =
  "h-9 rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-700 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

/** Tableau avec recherche, tri par colonne et pagination côté client. */
export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading,
  error,
  onRetry,
  searchPlaceholder = "Rechercher…",
  toolbar,
  emptyTitle = "Aucun élément",
  emptyMessage,
  emptyAction,
  emptyIcon = <Inbox className="h-5 w-5" />,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? rows.filter((row) => columns.some((c) => c.value && String(c.value(row)).toLowerCase().includes(q)))
      : rows;
    const col = sort && columns.find((c) => c.key === sort.key);
    if (sort && col?.value) {
      const get = col.value;
      result = [...result].sort((a, b) => {
        const va = get(a);
        const vb = get(b);
        const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "fr");
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [rows, columns, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  const initialLoading = loading && rows.length === 0 && !error;

  return (
    <Card className="overflow-hidden">
      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 dark:bg-slate-800/40">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400",
                    c.align === "right" ? "text-right" : "text-left",
                    c.className,
                  )}
                >
                  {c.value ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="group inline-flex items-center gap-1 uppercase hover:text-slate-900 dark:hover:text-white"
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? <ChevronUp className="h-3.5 w-3.5 text-brand-600" /> : <ChevronDown className="h-3.5 w-3.5 text-brand-600" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {initialLoading ? (
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length}>
                  <ErrorState message={error} onRetry={onRetry} />
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {search ? (
                    <EmptyState
                      icon={<Search className="h-5 w-5" />}
                      title="Aucun résultat"
                      description={`Aucun élément ne correspond à « ${search} ».`}
                    />
                  ) : (
                    <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyMessage} action={emptyAction} />
                  )}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={rowKey(row)} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-4 py-3 text-slate-600 dark:text-slate-300",
                        c.align === "right" && "text-right",
                        c.className,
                      )}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pied : nombre de résultats + pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="tabular">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {start + 1}–{Math.min(start + pageSize, filtered.length)}
              </span>{" "}
              sur <span className="font-medium text-slate-700 dark:text-slate-200">{filtered.length}</span>
              {filtered.length !== rows.length && ` (filtré sur ${rows.length})`}
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className={cn(selectClass, "h-8 text-xs")}
              aria-label="Lignes par page"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
          {totalPages > 1 && (
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <PageButton onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} label="Page précédente">
                <ChevronLeft className="h-4 w-4" />
              </PageButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && p - arr[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
                    <PageButton onClick={() => setPage(p)} active={p === currentPage} label={`Page ${p}`}>
                      {p}
                    </PageButton>
                  </React.Fragment>
                ))}
              <PageButton onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} label="Page suivante">
                <ChevronRight className="h-4 w-4" />
              </PageButton>
            </nav>
          )}
        </div>
      )}
    </Card>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium tabular transition-colors disabled:opacity-40",
        active
          ? "bg-brand-600 text-white shadow-xs"
          : "text-slate-600 hover:bg-slate-100 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800",
      )}
    >
      {children}
    </button>
  );
}

/** Bouton d'action d'une ligne (voir / modifier / supprimer). */
export function RowAction({
  title,
  onClick,
  color,
  children,
}: {
  title: string;
  onClick: () => void;
  color: "blue" | "green" | "red";
  children: React.ReactNode;
}) {
  const hover = {
    blue: "hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10",
    green: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white",
    red: "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10",
  }[color];
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn("rounded-md p-1.5 text-slate-400 transition-colors", hover)}
    >
      {children}
    </button>
  );
}
