import { Shell, shellMetadata, viewport } from "@/components/Shell";
import { EnLang } from "@/components/lang/En";

export const metadata = shellMetadata("en");
export { viewport };

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <Shell lang="en" Provider={EnLang}>{children}</Shell>;
}
