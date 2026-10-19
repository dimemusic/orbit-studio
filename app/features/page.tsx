import type { Metadata } from "next";
import { AppWindow } from "@/components/sections/AppWindow";
import { Features } from "@/components/sections/Features";
import { Search } from "@/components/sections/Search";
import { G } from "@/components/ui/Bits";
import { CtaBand } from "@/components/ui/CtaBand";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Можливості",
  description: "Версії, правки, експорти, синк, граф файлів і семантичний пошук у Cloud Sphere.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        crumb="Можливості"
        title={
          <>
            Усе, що <G tone="mind">пам&apos;ятає</G> Cloud Sphere.
          </>
        }
        lead="Кожну можливість можна спробувати просто тут."
      />
      <Features />
      <Search />
      <Section
        id="graph"
        eyebrow={{ label: "Граф файлу", color: "blue" }}
        title={
          <>
            Один файл, <G tone="calm">уся історія.</G>
          </>
        }
        lead="Версії, правки й експорти одного макета в одному вікні."
      >
        <div data-reveal className="w-full max-w-[1320px]">
          <AppWindow />
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
