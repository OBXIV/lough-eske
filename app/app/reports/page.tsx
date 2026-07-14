import { FeatureUnavailable } from "@/components/entitlements/feature-unavailable";
import { ReportsWorkspace, type ReportPanel } from "@/components/broker-portal/reports-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import {
  getAgents,
  getRecruitingActivities,
  getRecruits,
  getTenantEntitlements,
  getTransactions,
  tenantHasFeature,
} from "@/lib/data/app-data";

type ReportsPageProps = {
  searchParams?: Promise<{
    panel?: string;
  }>;
};

const reportPanels: ReportPanel[] = ["recruiting", "production", "transactions", "gci"];

function reportPanelFromQuery(panel?: string): ReportPanel {
  return reportPanels.includes(panel as ReportPanel) ? (panel as ReportPanel) : "recruiting";
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const session = await requirePermission("view_reports");
  const params = await searchParams;
  const [entitlements, hasReports] = await Promise.all([
    getTenantEntitlements(session),
    tenantHasFeature(session, "reports"),
  ]);

  if (!hasReports) {
    return <FeatureUnavailable feature="reports" entitlements={entitlements} />;
  }

  const [agents, recruits, transactions, recruitingActivities] = await Promise.all([
    getAgents(session),
    getRecruits(session),
    getTransactions(session),
    getRecruitingActivities(session),
  ]);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Executive reporting for recruiting, production, transaction volume, and GCI forecast, with drilldowns and a meeting-ready export."
        eyebrow="Intelligence"
      />
      <ReportsWorkspace
        agents={agents}
        initialPanel={reportPanelFromQuery(params?.panel)}
        recruitingActivities={recruitingActivities}
        recruits={recruits}
        tenantName={session.tenant.name}
        transactions={transactions}
      />
    </>
  );
}
