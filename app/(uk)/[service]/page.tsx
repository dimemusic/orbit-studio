import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ServicePage } from "@/components/ServicePage";
import { contentFor } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { planBySlug, SLUG } from "@/lib/services";

const LANG = "uk" as const;
export const dynamicParams = false;
export const generateStaticParams = () => Object.values(SLUG).map((service) => ({ service }));

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
  const id = planBySlug((await params).service);
  if (!id) return {};
  const pg = contentFor(LANG).SERVICES.pages.items[id];
  return pageMetadata(LANG, `/${SLUG[id]}`, { title: pg.title, description: pg.description });
}

export default async function Page({ params }: { params: Promise<{ service: string }> }) {
  const id = planBySlug((await params).service);
  if (!id) notFound();
  return (
    <>
      <JsonLd lang={LANG} plan={id} />
      <ServicePage id={id} />
    </>
  );
}
