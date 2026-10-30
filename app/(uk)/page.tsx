import { HomePage } from "@/components/HomePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("uk", "/");

export default function Page() {
  return <HomePage lang="uk" />;
}
