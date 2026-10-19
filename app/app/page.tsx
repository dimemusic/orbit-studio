import { CloudApp } from "@/components/app/CloudApp";
import type { PlanId } from "@/lib/demo-files";

// ?plan= comes from the signup success screen and sets the storage limit
export default async function AppPage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const { plan } = await searchParams;
  const p = Array.isArray(plan) ? plan[0] : plan;
  // null = keep the plan the store remembers (e.g. coming back from a file)
  const initial: PlanId | null = p === "pro" || p === "team" || p === "free" ? p : null;
  return <CloudApp plan={initial} />;
}
