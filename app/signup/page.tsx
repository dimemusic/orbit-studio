import type { Metadata } from "next";
import { SignupForm, type PlanId } from "@/components/signup/SignupForm";

// the layout title template adds « · Cloud Sphere»
export const metadata: Metadata = { title: "Реєстрація" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const { plan } = await searchParams;
  const p = Array.isArray(plan) ? plan[0] : plan;
  const initial: PlanId = p === "pro" || p === "team" ? p : "free";
  return <SignupForm initialPlan={initial} />;
}
