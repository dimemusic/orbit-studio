import { Shell, shellMetadata, viewport } from "@/components/Shell";

export const metadata = shellMetadata("uk");
export { viewport };

export default function UkLayout({ children }: { children: React.ReactNode }) {
  return <Shell lang="uk">{children}</Shell>;
}
