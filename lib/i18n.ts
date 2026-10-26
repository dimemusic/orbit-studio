import { uk, type Content, type Lang } from "./content";
import { en } from "./content.en";

export const DICT: Record<Lang, Content> = { uk, en };
export const contentFor = (lang: Lang) => DICT[lang];
/** the same page in the other language: "/" ⇄ "/en", "/privacy" ⇄ "/en/privacy" */
export const otherPath = (path: string, to: Lang) => {
  const bare = path.replace(/^\/en(?=\/|$)/, "") || "/";
  return to === "en" ? (bare === "/" ? "/en" : `/en${bare}`) : bare;
};
