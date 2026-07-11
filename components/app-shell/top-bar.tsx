"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Search, X } from "lucide-react";

import { searchWorkspaceAction } from "@/app/app/actions";
import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/lib/auth/actions";
import type { WorkspaceSearchResult } from "@/lib/data/app-data";
import type { Tenant, TenantEntitlements, UserSession } from "@/types/domain";

type TopBarProps = {
  session: UserSession;
  entitlements: TenantEntitlements;
  visibleTenants: Tenant[];
  environmentLabel: string;
};

const SEARCH_DEBOUNCE_MS = 250;

function WorkspaceSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkspaceSearchResult[]>([]);
  const [resultsQuery, setResultsQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const requestIdRef = useRef(0);
  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery !== "" && resultsQuery !== trimmedQuery;

  useEffect(() => {
    if (!trimmedQuery) return;

    const requestId = ++requestIdRef.current;
    const timeout = setTimeout(() => {
      searchWorkspaceAction(trimmedQuery).then((found) => {
        if (requestIdRef.current === requestId) {
          setResults(found);
          setResultsQuery(trimmedQuery);
        }
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [trimmedQuery]);

  function clearSearch() {
    setQuery("");
    setResults([]);
    setResultsQuery("");
    setIsOpen(false);
  }

  return (
    <div className="relative hidden min-w-80 lg:block">
      <label className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-text-secondary focus-within:border-accent/50">
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="sr-only">Search agents, recruits, and transactions</span>
        <input
          className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-secondary"
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          placeholder="Search agents, recruits, transactions"
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="shrink-0 rounded p-0.5 text-text-secondary transition hover:text-text-primary"
            onClick={clearSearch}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </label>
      {isOpen && trimmedQuery ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-md border border-border bg-surface p-2 shadow-card">
          {isSearching ? (
            <p className="px-2 py-3 text-sm text-text-secondary">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-2 py-3 text-sm text-text-secondary">No matches for &quot;{query}&quot;</p>
          ) : (
            <div className="space-y-1">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition hover:bg-surface-muted"
                  href={result.href}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-text-primary">{result.label}</span>
                    <span className="block truncate text-xs text-text-secondary">{result.subtitle}</span>
                  </span>
                  <Badge>{result.type}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function TopBar({ session, entitlements, visibleTenants, environmentLabel }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Workspace</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-text-primary">{session.tenant.name}</h2>
            <Badge variant={session.tenant.status === "demo" ? "accent" : "default"}>{session.tenant.status}</Badge>
            <Badge variant="info">{entitlements.planName}</Badge>
            <Badge variant={environmentLabel === "Stage" ? "info" : "default"}>{environmentLabel}</Badge>
          </div>
        </div>
        <WorkspaceSearch />
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card">
            <span>{visibleTenants.length > 1 ? `${visibleTenants.length} tenants` : "Tenant"}</span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
          <form action={signOutAction}>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card"
              type="submit"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
