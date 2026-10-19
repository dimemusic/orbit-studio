import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileScreen } from "@/components/app/FileScreen";
import { FILE_BY_ID } from "@/lib/demo-files";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: FILE_BY_ID[id]?.name ?? "Файл" };
}

export default async function FilePage({ params }: Params) {
  const { id } = await params;
  if (!FILE_BY_ID[id]) notFound();
  return <FileScreen id={id} />;
}
