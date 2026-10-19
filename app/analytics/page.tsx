import type { Metadata } from "next";
import { Stats } from "@/components/sections/Stats";
import { Uptime } from "@/components/sections/Uptime";
import { G } from "@/components/ui/Bits";
import { CtaBand } from "@/components/ui/CtaBand";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: { absolute: "Cloud Sphere в цифрах" },
  description: "Файли під шифруванням, швидкість синку за регіонами, сховище за типами файлів і доступність. Цифри вигадані.",
};

export default function AnalyticsPage() {
  return (
    <>
      <PageHero
        crumb="Аналітика"
        title={
          <>
            Cloud Sphere <G tone="ice">в цифрах.</G>
          </>
        }
        lead="Рік роботи, швидкість і доступність. Цифри вигадані для концепту."
      />
      <Stats />
      <Uptime />
      <CtaBand />
    </>
  );
}
