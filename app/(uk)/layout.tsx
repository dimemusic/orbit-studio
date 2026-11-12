import { Shell, shellMetadata, viewport } from "@/components/Shell";
import { UkLang } from "@/components/lang/Uk";

export const metadata = shellMetadata("uk");
export { viewport };

export default function UkLayout({ children }: { children: React.ReactNode }) {
  return <Shell lang="uk" Provider={UkLang}>{children}</Shell>;
}
