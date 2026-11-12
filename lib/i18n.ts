// Server-side access to the copy of both languages. Client components never import this file (it would ship both
// languages to every visitor): they read the current language's copy with useContent() (components/Lang.tsx).
import { uk, type Content, type Lang } from "./content";
import { en } from "./content.en";

export { otherPath, SITE_URL } from "./site";

const DICT: Record<Lang, Content> = { uk, en };
export const contentFor = (lang: Lang) => DICT[lang];
