import type { Metadata } from "next";
import { AutoLang } from "@/components/lang/Auto";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Shell, shellMetadata, viewport } from "@/components/Shell";

/**
 * The 404 of the whole site (`experimental.globalNotFound` in next.config.ts): with two root layouts there is no
 * place for a plain not-found.tsx, and Next showed its own bare English page. One static file for every unknown
 * address, in the site's frame; `AutoLang` turns it English under /en. Next adds `noindex` to it by itself.
 */
// one title for both languages: the file is static, and a title changed in the browser is reset by the framework
export const metadata: Metadata = { ...shellMetadata("uk"), title: "404 · MaxArt Digital" };
export { viewport };

export default function GlobalNotFound() {
  return (
    <Shell lang="uk" Provider={AutoLang}>
      <NotFoundPage />
    </Shell>
  );
}
