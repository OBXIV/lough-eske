import type { FeatureKey, PlanKey, TenantEntitlements } from "@/types/domain";

type PlanDefinition = {
  id: string;
  key: PlanKey;
  name: string;
  baseSeatLimit: number;
  perSeatPriceCents: number;
  basePriceCents: number;
  features: FeatureKey[];
};

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  reports: "Reports",
  agent_portal: "Agent Portal",
  mls_sync: "MLS Sync",
};

export const FEATURE_KEYS = Object.keys(FEATURE_LABELS) as FeatureKey[];

export const PLAN_CATALOG: Record<PlanKey, PlanDefinition> = {
  core: {
    id: "70000000-0000-4000-8000-000000000001",
    key: "core",
    name: "Core",
    baseSeatLimit: 5,
    perSeatPriceCents: 2900,
    basePriceCents: 19900,
    features: ["reports", "agent_portal"],
  },
  growth: {
    id: "70000000-0000-4000-8000-000000000002",
    key: "growth",
    name: "Growth",
    baseSeatLimit: 15,
    perSeatPriceCents: 2500,
    basePriceCents: 49900,
    features: ["reports", "agent_portal", "mls_sync"],
  },
  scale: {
    id: "70000000-0000-4000-8000-000000000003",
    key: "scale",
    name: "Scale",
    baseSeatLimit: 30,
    perSeatPriceCents: 1900,
    basePriceCents: 89900,
    features: ["reports", "agent_portal", "mls_sync"],
  },
};

export function calculateMonthlyPriceCents(
  basePriceCents: number,
  perSeatPriceCents: number,
  baseSeatLimit: number,
  subscribedSeats: number,
) {
  return basePriceCents + Math.max(0, subscribedSeats - baseSeatLimit) * perSeatPriceCents;
}

export function createFallbackEntitlements(occupiedSeats: number): TenantEntitlements {
  const plan = PLAN_CATALOG.core;
  const subscribedSeats = Math.max(plan.baseSeatLimit, occupiedSeats);

  return {
    planId: plan.id,
    planKey: plan.key,
    planName: plan.name,
    baseSeatLimit: plan.baseSeatLimit,
    subscribedSeats,
    activeSeats: occupiedSeats,
    invitedSeats: 0,
    occupiedSeats,
    availableSeats: Math.max(0, subscribedSeats - occupiedSeats),
    basePriceCents: plan.basePriceCents,
    perSeatPriceCents: plan.perSeatPriceCents,
    monthlyPriceCents: calculateMonthlyPriceCents(
      plan.basePriceCents,
      plan.perSeatPriceCents,
      plan.baseSeatLimit,
      subscribedSeats,
    ),
    features: [...plan.features],
  };
}

export function hasFeature(entitlements: TenantEntitlements, feature: FeatureKey) {
  return entitlements.features.includes(feature);
}
