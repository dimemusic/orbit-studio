import type { Metadata } from "next";
import { SecurityDetail } from "@/components/sections/Security";
import { G } from "@/components/ui/Bits";
import { CtaBand } from "@/components/ui/CtaBand";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Безпека",
  description: "Шифрування на пристрої, біометрія і 2FA, дані в трьох зонах ЄС.",
};

export default function SecurityPage() {
  return (
    <>
      <PageHero
        crumb="Безпека"
        title={
          <>
            Твої файли читаєш <G tone="shield">лише ти.</G>
          </>
        }
        lead="Як Cloud Sphere шифрує, впускає й зберігає твої файли."
      />
      <SecurityDetail />
      <CtaBand />
    </>
  );
}
