"use client";

import { useMemo, useState } from "react";
import { BarChart3, CircleDollarSign, Download, Funnel, Printer, Users } from "lucide-react";
import Link from "next/link";

import { DetailField } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { currentDateKey } from "@/lib/task-filters";
import { cn, formatCurrency, formatDate, formatDateOnly, formatDateTime, shiftDateKey } from "@/lib/utils";
import type { Agent, Recruit, RecruitingActivity, Transaction } from "@/types/domain";

export type ReportPanel = "recruiting" | "production" | "transactions" | "gci";
export type ReportRange = "all" | "past_30" | "past_90" | "next_30" | "next_90" | "ytd";

type SelectedRecord =
  | { type: "agent"; id: string }
  | { type: "recruit"; id: string }
  | { type: "transaction"; id: string };

type ReportsWorkspaceProps = {
  agents: Agent[];
  initialPanel: ReportPanel;
  recruitingActivities: RecruitingActivity[];
  recruits: Recruit[];
  tenantName: string;
  transactions: Transaction[];
};

const recruitStageOrder: Recruit["stage"][] = ["Identified", "Contacted", "Engaged", "Offer Pending", "Joined", "Lost"];
const transactionStageOrder: Transaction["stage"][] = [
  "Lead",
  "Listing",
  "Under Contract",
  "Inspection",
  "Clear to Close",
  "Closed",
  "Cancelled",
];

const reportRanges: { value: ReportRange; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "past_30", label: "Past 30 days" },
  { value: "past_90", label: "Past 90 days" },
  { value: "next_30", label: "Next 30 days" },
  { value: "next_90", label: "Next 90 days" },
  { value: "ytd", label: "Year to date" },
];

function dateKeyOf(value: string) {
  return value ? value.slice(0, 10) : "";
}

function startOfYearKey(todayKey: string) {
  return `${todayKey.slice(0, 4)}-01-01`;
}

// Date ranges are a window around today rather than a strict from/to picker:
// reports mix backward-looking data (closings, activity) and forward-looking
// pipeline (expected close), so a single symmetric control covers both.
function inRange(dateKey: string, range: ReportRange, todayKey: string) {
  if (range === "all") return true;
  if (!dateKey) return false;

  if (range === "past_30") return dateKey >= shiftDateKey(todayKey, -30) && dateKey <= todayKey;
  if (range === "past_90") return dateKey >= shiftDateKey(todayKey, -90) && dateKey <= todayKey;
  if (range === "next_30") return dateKey >= todayKey && dateKey <= shiftDateKey(todayKey, 30);
  if (range === "next_90") return dateKey >= todayKey && dateKey <= shiftDateKey(todayKey, 90);
  return dateKey >= startOfYearKey(todayKey) && dateKey <= todayKey;
}

function heatVariant(heatScore: Recruit["heatScore"]) {
  if (heatScore === "Hot") return "danger";
  if (heatScore === "Warm") return "warning";
  return "info";
}

function transactionStatusVariant(status: Transaction["status"]) {
  if (status === "active") return "success";
  if (status === "cancelled") return "danger";
  return "default";
}

function agentStatusVariant(status: Agent["brokerageStatus"]) {
  if (status === "active") return "success";
  if (status === "former") return "danger";
  return "default";
}

const clickableRow = "cursor-pointer transition hover:bg-surface-muted";

function recordRowProps(open: () => void) {
  return {
    onClick: open,
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    },
    role: "button" as const,
    tabIndex: 0,
  };
}

function isRecruitAtRisk(recruit: Recruit, todayKey: string) {
  if (recruit.stage === "Joined" || recruit.stage === "Lost") return false;

  const followUpKey = dateKeyOf(recruit.nextFollowUpDate);
  const overdue = followUpKey !== "" && followUpKey < todayKey;

  return recruit.heatScore === "Cold" || overdue;
}

function isTransactionAtRisk(transaction: Transaction, todayKey: string) {
  if (transaction.status !== "active") return false;

  const closeKey = dateKeyOf(transaction.expectedCloseDate);
  return closeKey !== "" && closeKey < todayKey;
}

function csvCell(value: string | number) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rowsToCsv(rows: (string | number)[][]) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type EmptyPanelStateProps = {
  className?: string;
  message: string;
};

function EmptyPanelState({ className, message }: EmptyPanelStateProps) {
  return (
    <p className={cn("rounded-md border border-dashed border-border py-10 text-center text-sm text-text-secondary", className)}>
      {message}
    </p>
  );
}

export function ReportsWorkspace({
  agents,
  initialPanel,
  recruitingActivities,
  recruits,
  tenantName,
  transactions,
}: ReportsWorkspaceProps) {
  const [activePanel, setActivePanel] = useState<ReportPanel>(initialPanel);
  const [range, setRange] = useState<ReportRange>("all");
  const [selectedRecord, setSelectedRecord] = useState<SelectedRecord | null>(null);
  const todayKey = useMemo(() => currentDateKey(), []);

  // Ambiguous display names resolve to null so a row never opens the wrong record.
  const agentsByName = useMemo(() => {
    const map = new Map<string, Agent | null>();
    agents.forEach((agent) => {
      const name = `${agent.firstName} ${agent.lastName}`;
      map.set(name, map.has(name) ? null : agent);
    });
    return map;
  }, [agents]);
  const recruitsById = useMemo(() => new Map(recruits.map((recruit) => [recruit.id, recruit])), [recruits]);
  const selectedAgent = selectedRecord?.type === "agent"
    ? agents.find((agent) => agent.id === selectedRecord.id) ?? null
    : null;
  const selectedRecruit = selectedRecord?.type === "recruit" ? recruitsById.get(selectedRecord.id) ?? null : null;
  const selectedTransaction = selectedRecord?.type === "transaction"
    ? transactions.find((transaction) => transaction.id === selectedRecord.id) ?? null
    : null;
  const selectedRecruitActivities = useMemo(
    () => (selectedRecruit ? recruitingActivities.filter((activity) => activity.recruitId === selectedRecruit.id) : []),
    [recruitingActivities, selectedRecruit],
  );

  const activeRecruits = useMemo(
    () => recruits.filter((recruit) => recruit.stage !== "Joined" && recruit.stage !== "Lost"),
    [recruits],
  );
  const activeAgents = useMemo(() => agents.filter((agent) => agent.brokerageStatus !== "former"), [agents]);
  const activeDeals = useMemo(() => transactions.filter((transaction) => transaction.status === "active"), [transactions]);
  const totalProduction = useMemo(
    () => activeAgents.reduce((total, agent) => total + agent.productionYtd, 0),
    [activeAgents],
  );
  const gciPipeline = useMemo(
    () => activeDeals.reduce((total, transaction) => total + transaction.estimatedGci, 0),
    [activeDeals],
  );

  const filteredActivities = useMemo(
    () => recruitingActivities.filter((activity) => inRange(dateKeyOf(activity.activityDate), range, todayKey)),
    [range, recruitingActivities, todayKey],
  );
  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => inRange(dateKeyOf(transaction.expectedCloseDate), range, todayKey)),
    [range, todayKey, transactions],
  );
  const filteredClosings = useMemo(
    () => agents.filter((agent) => inRange(dateKeyOf(agent.lastCloseDate), range, todayKey)),
    [agents, range, todayKey],
  );

  const atRiskRecruits = useMemo(
    () => recruits
      .filter((recruit) => isRecruitAtRisk(recruit, todayKey))
      .sort((a, b) => dateKeyOf(a.nextFollowUpDate).localeCompare(dateKeyOf(b.nextFollowUpDate))),
    [recruits, todayKey],
  );
  const atRiskTransactions = useMemo(
    () => transactions
      .filter((transaction) => isTransactionAtRisk(transaction, todayKey))
      .sort((a, b) => dateKeyOf(a.expectedCloseDate).localeCompare(dateKeyOf(b.expectedCloseDate))),
    [todayKey, transactions],
  );
  const atRiskGci = useMemo(
    () => atRiskTransactions.reduce((total, transaction) => total + transaction.estimatedGci, 0),
    [atRiskTransactions],
  );

  const topAgents = useMemo(
    () => [...activeAgents].sort((a, b) => b.productionYtd - a.productionYtd).slice(0, 5),
    [activeAgents],
  );

  const recruitFunnel = useMemo(
    () => recruitStageOrder.map((stage) => ({ stage, count: recruits.filter((recruit) => recruit.stage === stage).length })),
    [recruits],
  );

  const gciByStage = useMemo(
    () => transactionStageOrder.map((stage) => {
      const stageTransactions = filteredTransactions.filter((transaction) => transaction.stage === stage);
      return {
        stage,
        count: stageTransactions.length,
        gci: stageTransactions.reduce((total, transaction) => total + transaction.estimatedGci, 0),
      };
    }),
    [filteredTransactions],
  );
  const gciByAgent = useMemo(() => {
    const totals = new Map<string, number>();
    filteredTransactions.forEach((transaction) => {
      totals.set(transaction.agent, (totals.get(transaction.agent) ?? 0) + transaction.estimatedGci);
    });

    return [...totals.entries()]
      .map(([agent, gci]) => ({ agent, gci }))
      .sort((a, b) => b.gci - a.gci)
      .slice(0, 5);
  }, [filteredTransactions]);
  const gciPipelineInRange = useMemo(
    () => filteredTransactions
      .filter((transaction) => transaction.status === "active")
      .reduce((total, transaction) => total + transaction.estimatedGci, 0),
    [filteredTransactions],
  );

  const summaryCards: { key: ReportPanel; label: string; value: string; hint: string; icon: typeof Funnel }[] = [
    { key: "recruiting", label: "Recruiting funnel", value: `${activeRecruits.length} active`, hint: `${recruits.length} total records`, icon: Funnel },
    { key: "production", label: "Agent production", value: formatCurrency(totalProduction), hint: "Year to date, active roster", icon: Users },
    { key: "transactions", label: "Transaction volume", value: `${activeDeals.length} active`, hint: "Open pipeline deals", icon: BarChart3 },
    { key: "gci", label: "GCI forecast", value: formatCurrency(gciPipeline), hint: "Estimated from active deals", icon: CircleDollarSign },
  ];

  const exportData = useMemo(() => {
    if (activePanel === "recruiting") {
      return {
        filename: `reports-recruiting-${range}-${todayKey}.csv`,
        rows: [
          ["Recruit", "Stage", "Heat", "Next follow-up", "At risk"],
          ...recruits.map((recruit) => [
            recruit.name,
            recruit.stage,
            recruit.heatScore,
            formatDateOnly(recruit.nextFollowUpDate),
            isRecruitAtRisk(recruit, todayKey) ? "Yes" : "No",
          ]),
        ] as (string | number)[][],
      };
    }

    if (activePanel === "production") {
      return {
        filename: `reports-production-${range}-${todayKey}.csv`,
        rows: [
          ["Agent", "Status", "Production YTD", "GCI YTD", "Last close"],
          ...activeAgents.map((agent) => [
            `${agent.firstName} ${agent.lastName}`,
            agent.brokerageStatus,
            agent.productionYtd,
            agent.gciYtd,
            formatDateOnly(agent.lastCloseDate),
          ]),
        ] as (string | number)[][],
      };
    }

    if (activePanel === "transactions") {
      return {
        filename: `reports-transactions-${range}-${todayKey}.csv`,
        rows: [
          ["Agent", "Client", "Property", "Stage", "Estimated GCI", "Expected close", "Status", "At risk"],
          ...filteredTransactions.map((transaction) => [
            transaction.agent,
            transaction.clientName,
            transaction.propertyAddress,
            transaction.stage,
            transaction.estimatedGci,
            formatDateOnly(transaction.expectedCloseDate),
            transaction.status,
            isTransactionAtRisk(transaction, todayKey) ? "Yes" : "No",
          ]),
        ] as (string | number)[][],
      };
    }

    return {
      filename: `reports-gci-${range}-${todayKey}.csv`,
      rows: [
        ["Stage", "Deal count", "Estimated GCI"],
        ...gciByStage.map((row) => [row.stage, row.count, row.gci]),
      ] as (string | number)[][],
    };
  }, [activeAgents, activePanel, filteredTransactions, gciByStage, range, recruits, todayKey]);

  return (
    <>
      <div className="mb-4 hidden print:block">
        <p className="text-sm font-semibold text-text-primary">{tenantName}</p>
        <p className="text-xs text-text-secondary">Report generated {formatDateOnly(todayKey)}</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const isActive = activePanel === card.key;

          return (
            <button
              key={card.key}
              className={cn(
                "rounded-lg border bg-surface p-5 text-left shadow-card transition hover:border-accent/40 hover:bg-surface-muted",
                isActive ? "border-accent ring-1 ring-accent/30" : "border-border",
              )}
              onClick={() => setActivePanel(card.key)}
              type="button"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="w-fit rounded-md bg-surface-muted p-2 text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                {isActive ? <Badge variant="accent">Viewing</Badge> : null}
              </div>
              <h2 className="text-base font-semibold text-text-primary">{card.label}</h2>
              <p className="mt-3 text-2xl font-semibold">{card.value}</p>
              <p className="mt-2 text-sm text-text-secondary">{card.hint}</p>
            </button>
          );
        })}
      </section>

      <div className="mt-6 flex flex-col gap-3 border-b border-border pb-5 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <span>Date range</span>
          <select
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card"
            onChange={(event) => setRange(event.target.value as ReportRange)}
            value={range}
          >
            {reportRanges.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card transition hover:bg-surface-muted"
            onClick={() => window.print()}
            type="button"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card transition hover:bg-surface-muted"
            onClick={() => downloadCsv(exportData.filename, rowsToCsv(exportData.rows))}
            type="button"
          >
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </button>
        </div>
      </div>

      {activePanel === "recruiting" ? (
        <section className="mt-6 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Recruiting funnel by stage</h2>
                <p className="mt-1 text-sm text-text-secondary">Full pipeline snapshot, independent of the selected date range.</p>
              </div>
              <Badge variant="accent">{recruits.length} records</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recruitFunnel.map(({ stage, count }) => {
                const width = recruits.length > 0 ? Math.max(6, Math.round((count / recruits.length) * 100)) : 0;

                return (
                  <Link
                    key={stage}
                    className="rounded-md border border-border bg-surface-muted p-4 transition hover:border-accent/40 hover:bg-surface"
                    href={`/app/recruiting?stage=${encodeURIComponent(stage)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-text-primary">{stage}</p>
                      <p className="text-sm font-semibold text-text-primary">{count}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">At-risk recruits</h2>
                <p className="mt-1 text-sm text-text-secondary">Cold prospects or open recruits with an overdue follow-up.</p>
              </div>
              <Badge variant={atRiskRecruits.length > 0 ? "warning" : "success"}>{atRiskRecruits.length}</Badge>
            </div>
            {atRiskRecruits.length > 0 ? (
              <DataTable className="mt-5">
                <thead>
                  <tr>
                    <TableHead>Recruit</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Heat</TableHead>
                    <TableHead>Next follow-up</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {atRiskRecruits.map((recruit) => (
                    <tr key={recruit.id} className={clickableRow} {...recordRowProps(() => setSelectedRecord({ type: "recruit", id: recruit.id }))}>
                      <TableCell className="font-medium">{recruit.name}</TableCell>
                      <TableCell><Badge variant="accent">{recruit.stage}</Badge></TableCell>
                      <TableCell><Badge variant={heatVariant(recruit.heatScore)}>{recruit.heatScore}</Badge></TableCell>
                      <TableCell className="text-text-secondary">{formatDateOnly(recruit.nextFollowUpDate)}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <EmptyPanelState className="mt-5" message="No recruits are cold or past their follow-up date." />
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Recent recruiting activity</h2>
                <p className="mt-1 text-sm text-text-secondary">Calls, meetings, and stage changes within the selected date range.</p>
              </div>
              <Badge variant="info">{filteredActivities.length}</Badge>
            </div>
            {filteredActivities.length > 0 ? (
              <div className="mt-5 divide-y divide-border">
                {filteredActivities.map((activity) => {
                  const hasRecruit = recruitsById.has(activity.recruitId);

                  return (
                    <div
                      key={activity.id}
                      className={cn("flex items-start justify-between gap-4 px-2 py-3", hasRecruit && "cursor-pointer rounded-md transition hover:bg-surface-muted")}
                      {...(hasRecruit ? recordRowProps(() => setSelectedRecord({ type: "recruit", id: activity.recruitId })) : {})}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">{activity.recruitName}</p>
                        <p className="mt-1 text-xs text-text-secondary">{activity.notes}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge variant="info">{activity.activityType}</Badge>
                        <p className="mt-1 text-xs text-text-secondary">{formatDate(activity.activityDate)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyPanelState className="mt-5" message="No recruiting activity in this date range." />
            )}
          </Card>
        </section>
      ) : null}

      {activePanel === "production" ? (
        <section className="mt-6 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Top agents by production</h2>
                <p className="mt-1 text-sm text-text-secondary">Year-to-date production across the active and onboarding roster.</p>
              </div>
              <Badge variant="accent">Top {topAgents.length}</Badge>
            </div>
            {topAgents.length > 0 ? (
              <DataTable className="mt-5">
                <thead>
                  <tr>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Production YTD</TableHead>
                    <TableHead>GCI YTD</TableHead>
                    <TableHead>Last close</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topAgents.map((agent) => (
                    <tr key={agent.id} className={clickableRow} {...recordRowProps(() => setSelectedRecord({ type: "agent", id: agent.id }))}>
                      <TableCell className="font-medium">{agent.firstName} {agent.lastName}</TableCell>
                      <TableCell><Badge variant={agent.brokerageStatus === "active" ? "success" : "default"}>{agent.brokerageStatus}</Badge></TableCell>
                      <TableCell>{formatCurrency(agent.productionYtd)}</TableCell>
                      <TableCell>{formatCurrency(agent.gciYtd)}</TableCell>
                      <TableCell className="text-text-secondary">{formatDateOnly(agent.lastCloseDate)}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <EmptyPanelState className="mt-5" message="No active agents on the roster yet." />
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Recent closings</h2>
                <p className="mt-1 text-sm text-text-secondary">Agents with a last-close date inside the selected date range.</p>
              </div>
              <Badge variant="info">{filteredClosings.length}</Badge>
            </div>
            {filteredClosings.length > 0 ? (
              <DataTable className="mt-5">
                <thead>
                  <tr>
                    <TableHead>Agent</TableHead>
                    <TableHead>Last close</TableHead>
                    <TableHead>GCI YTD</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClosings.map((agent) => (
                    <tr key={agent.id} className={clickableRow} {...recordRowProps(() => setSelectedRecord({ type: "agent", id: agent.id }))}>
                      <TableCell className="font-medium">{agent.firstName} {agent.lastName}</TableCell>
                      <TableCell className="text-text-secondary">{formatDateOnly(agent.lastCloseDate)}</TableCell>
                      <TableCell>{formatCurrency(agent.gciYtd)}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <EmptyPanelState className="mt-5" message="No agent closings fall in this date range." />
            )}
          </Card>
        </section>
      ) : null}

      {activePanel === "transactions" ? (
        <section className="mt-6 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Transactions in range</h2>
                <p className="mt-1 text-sm text-text-secondary">Deals with an expected close date inside the selected date range.</p>
              </div>
              <Link className="text-sm font-medium text-accent hover:underline print:hidden" href="/app/transactions">View all →</Link>
            </div>
            {filteredTransactions.length > 0 ? (
              <DataTable className="mt-5">
                <thead>
                  <tr>
                    <TableHead>Agent</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Estimated GCI</TableHead>
                    <TableHead>Expected close</TableHead>
                    <TableHead>Status</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className={clickableRow} {...recordRowProps(() => setSelectedRecord({ type: "transaction", id: transaction.id }))}>
                      <TableCell className="font-medium">{transaction.agent}</TableCell>
                      <TableCell>{transaction.clientName}</TableCell>
                      <TableCell><Badge variant="accent">{transaction.stage}</Badge></TableCell>
                      <TableCell>{formatCurrency(transaction.estimatedGci)}</TableCell>
                      <TableCell className="text-text-secondary">{formatDateOnly(transaction.expectedCloseDate)}</TableCell>
                      <TableCell><Badge variant={transactionStatusVariant(transaction.status)}>{transaction.status}</Badge></TableCell>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <EmptyPanelState className="mt-5" message="No transactions have an expected close date in this range." />
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">At-risk pipeline</h2>
                <p className="mt-1 text-sm text-text-secondary">Active deals already past their expected close date.</p>
              </div>
              <Badge variant={atRiskTransactions.length > 0 ? "danger" : "success"}>{atRiskTransactions.length}</Badge>
            </div>
            {atRiskTransactions.length > 0 ? (
              <DataTable className="mt-5">
                <thead>
                  <tr>
                    <TableHead>Client</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Estimated GCI</TableHead>
                    <TableHead>Expected close</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {atRiskTransactions.map((transaction) => (
                    <tr key={transaction.id} className={clickableRow} {...recordRowProps(() => setSelectedRecord({ type: "transaction", id: transaction.id }))}>
                      <TableCell className="font-medium">{transaction.clientName || transaction.propertyAddress}</TableCell>
                      <TableCell>{transaction.agent}</TableCell>
                      <TableCell><Badge variant="accent">{transaction.stage}</Badge></TableCell>
                      <TableCell>{formatCurrency(transaction.estimatedGci)}</TableCell>
                      <TableCell className="text-danger">{formatDateOnly(transaction.expectedCloseDate)}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            ) : (
              <EmptyPanelState className="mt-5" message="No active deals are past their expected close date." />
            )}
          </Card>
        </section>
      ) : null}

      {activePanel === "gci" ? (
        <section className="mt-6 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">GCI forecast by stage</h2>
                <p className="mt-1 text-sm text-text-secondary">Estimated GCI for active deals with an expected close date in the selected range.</p>
              </div>
              <Badge variant="accent">{formatCurrency(gciPipelineInRange)}</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {gciByStage.filter((row) => row.count > 0).map(({ stage, count, gci }) => (
                <div key={stage} className="rounded-md border border-border bg-surface-muted p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-text-primary">{stage}</p>
                    <Badge>{count}</Badge>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-text-primary">{formatCurrency(gci)}</p>
                </div>
              ))}
              {gciByStage.every((row) => row.count === 0) ? (
                <EmptyPanelState className="sm:col-span-2 xl:col-span-3" message="No deals fall in this date range." />
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Top GCI contributors</h2>
                <p className="mt-1 text-sm text-text-secondary">Agents with the highest estimated GCI in the selected date range.</p>
              </div>
              <Badge variant="accent">Top {gciByAgent.length}</Badge>
            </div>
            {gciByAgent.length > 0 ? (
              <DataTable className="mt-5">
                <thead>
                  <tr>
                    <TableHead>Agent</TableHead>
                    <TableHead>Estimated GCI</TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gciByAgent.map((row) => {
                    const agentRecord = agentsByName.get(row.agent);

                    return (
                      <tr
                        key={row.agent}
                        className={cn(agentRecord && clickableRow)}
                        {...(agentRecord ? recordRowProps(() => setSelectedRecord({ type: "agent", id: agentRecord.id })) : {})}
                      >
                        <TableCell className="font-medium">{row.agent}</TableCell>
                        <TableCell>{formatCurrency(row.gci)}</TableCell>
                      </tr>
                    );
                  })}
                </tbody>
              </DataTable>
            ) : (
              <EmptyPanelState className="mt-5" message="No GCI in this date range yet." />
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">GCI at risk</h2>
                <p className="mt-1 text-sm text-text-secondary">Estimated GCI tied to deals already past their expected close date.</p>
              </div>
              <Badge variant={atRiskGci > 0 ? "danger" : "success"}>{formatCurrency(atRiskGci)}</Badge>
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              {atRiskTransactions.length} active deal{atRiskTransactions.length === 1 ? "" : "s"} past expected close.
              See the at-risk pipeline in the Transaction volume panel for detail.
            </p>
          </Card>
        </section>
      ) : null}

      <DetailDrawer
        eyebrow={selectedAgent ? "Agent record" : selectedRecruit ? "Recruit record" : "Transaction record"}
        isOpen={Boolean(selectedAgent || selectedRecruit || selectedTransaction)}
        onClose={() => setSelectedRecord(null)}
        title={
          selectedAgent
            ? `${selectedAgent.firstName} ${selectedAgent.lastName}`
            : selectedRecruit
              ? selectedRecruit.name
              : selectedTransaction?.clientName || selectedTransaction?.propertyAddress || "Record"
        }
      >
        {selectedAgent ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Status" value={<Badge variant={agentStatusVariant(selectedAgent.brokerageStatus)}>{selectedAgent.brokerageStatus}</Badge>} />
              <DetailField label="Source" value={selectedAgent.source} />
              <DetailField label="Email" value={selectedAgent.email || "Not on file"} />
              <DetailField label="Phone" value={selectedAgent.phone || "Not on file"} />
              <DetailField label="License" value={selectedAgent.licenseNumber || "Not on file"} />
              <DetailField label="Last close" value={formatDateOnly(selectedAgent.lastCloseDate)} />
              <DetailField label="Production YTD" value={formatCurrency(selectedAgent.productionYtd)} />
              <DetailField label="GCI YTD" value={formatCurrency(selectedAgent.gciYtd)} />
            </dl>
            <Link
              className="inline-block text-sm font-medium text-accent hover:underline"
              href={`/app/agents?q=${encodeURIComponent(`${selectedAgent.firstName} ${selectedAgent.lastName}`)}`}
            >
              Open in Agents →
            </Link>
          </div>
        ) : null}
        {selectedRecruit ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Stage" value={<Badge variant="accent">{selectedRecruit.stage}</Badge>} />
              <DetailField label="Heat" value={<Badge variant={heatVariant(selectedRecruit.heatScore)}>{selectedRecruit.heatScore}</Badge>} />
              <DetailField label="Recruit score" value={selectedRecruit.recruitScore} />
              <DetailField label="Source" value={selectedRecruit.source} />
              <DetailField label="Next follow-up" value={formatDateOnly(selectedRecruit.nextFollowUpDate)} />
              <DetailField label="Notes" value={selectedRecruit.notesSummary || "No notes yet"} />
            </dl>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-text-primary">Recent recruiting activity</h3>
                <Badge>{selectedRecruitActivities.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {selectedRecruitActivities.length > 0 ? (
                  selectedRecruitActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="rounded-md border border-border bg-surface-muted px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-text-primary">{activity.activityType}</p>
                        <p className="text-xs text-text-secondary">{formatDate(activity.activityDate)}</p>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">{activity.notes}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-6 text-center text-sm text-text-secondary">
                    No recent activity for this recruit
                  </p>
                )}
              </div>
            </div>
            <Link
              className="inline-block text-sm font-medium text-accent hover:underline"
              href={`/app/recruiting?stage=${encodeURIComponent(selectedRecruit.stage)}`}
            >
              Open in Recruiting →
            </Link>
          </div>
        ) : null}
        {selectedTransaction ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Agent" value={selectedTransaction.agent} />
              <DetailField label="Client" value={selectedTransaction.clientName || "Not on file"} />
              <DetailField label="Property" value={selectedTransaction.propertyAddress || "Not on file"} />
              <DetailField label="Type" value={selectedTransaction.transactionType} />
              <DetailField label="Stage" value={<Badge variant="accent">{selectedTransaction.stage}</Badge>} />
              <DetailField label="Status" value={<Badge variant={transactionStatusVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>} />
              <DetailField label="List price" value={formatCurrency(selectedTransaction.listPrice)} />
              <DetailField label="Estimated GCI" value={formatCurrency(selectedTransaction.estimatedGci)} />
              <DetailField label="Expected close" value={formatDateOnly(selectedTransaction.expectedCloseDate)} />
              {selectedTransaction.finalizedAt ? (
                <DetailField
                  label={selectedTransaction.status === "cancelled" ? "Cancelled" : "Closed"}
                  value={
                    <span>
                      {formatDateTime(selectedTransaction.finalizedAt)}
                      <span className="mt-1 block text-xs font-normal text-text-secondary">
                        by {selectedTransaction.finalizedBy ?? "Unknown user"}
                      </span>
                    </span>
                  }
                />
              ) : null}
            </dl>
            <Link className="inline-block text-sm font-medium text-accent hover:underline" href="/app/transactions">
              Open in Transactions →
            </Link>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
