import { Shell, shellMetadata, viewport } from "@/components/Shell";

export const metadata = shellMetadata("en");
export { viewport };

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <Shell lang="en">{children}</Shell>;
}
