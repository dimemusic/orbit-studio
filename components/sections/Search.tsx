"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useMemo, useRef, useState } from "react";
import { ACCENT, type Accent } from "../ui/accent";
import { G, Tag } from "../ui/Bits";
import { Section } from "../ui/Section";

// file type → category colour
const EXT_COLOR: Record<string, Accent> = { psd: "violet", mov: "cyan", mp4: "cyan", png: "blue", blend: "green", pdf: "blue" };
const ext = (name: string) => name.split(".").pop() ?? "";
const UNDERSTANDS: { label: string; color: Accent }[] = [
  { label: "Людей", color: "violet" },
  { label: "Кольори", color: "cyan" },
  { label: "Об'єкти", color: "blue" },
  { label: "Статус схвалення", color: "green" },
];

// Semantic search over a fictional archive.
type FileItem = { name: string; meta: string; tags: string[] };

const FILES: FileItem[] = [
  { name: "kyt_cover_v3_final.psd", meta: "Сірий кит, Олеся Кравець", tags: ["обкладинка", "кит", "схвалила ірина", "фінал", "книга"] },
  { name: "kyt_cover_v2.psd", meta: "Сірий кит, Тарас Мельник", tags: ["обкладинка", "кит", "правки ірини", "чернетка"] },
  { name: "teaser_cut_04.mov", meta: "Весна 26, Тарас Мельник", tags: ["відео", "пляшка", "синій фон", "тизер"] },
  { name: "bottle_loop_blue.mp4", meta: "Весна 26, Данило Бойко", tags: ["відео", "пляшка", "синій фон", "луп"] },
  { name: "banner_1080x1920.png", meta: "Весна 26, Олеся Кравець", tags: ["банер", "пляшка", "синій фон", "сторіз"] },
  { name: "watch_catalog_hero.blend", meta: "Годинники Час, Данило Бойко", tags: ["3d", "модель", "годинник", "каталог"] },
  { name: "watch_strap_leather.blend", meta: "Годинники Час, Данило Бойко", tags: ["3d", "модель", "ремінець", "годинник"] },
  { name: "catalog_layout_v5.pdf", meta: "Годинники Час, Марта Савчук", tags: ["каталог", "верстка", "годинник", "друк"] },
];

const QUERIES = ["обкладинка, яку схвалила Ірина", "відео з пляшкою на синьому фоні", "3D-модель годинника для каталогу"];

const stem = (w: string) => w.slice(0, Math.max(4, Math.min(5, w.length)));
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);

function search(query: string) {
  const q = words(query).map(stem);
  if (!q.length) return [];
  return FILES.map((f) => {
    const hits = f.tags.filter((t) => words(t).some((w) => q.includes(stem(w)))).length;
    return { f, score: hits ? Math.min(99, 60 + hits * 12) : 0 };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export function Search() {
  return (
    <Section
      id="search"
      tall
      eyebrow={{ label: "Семантичний пошук", color: "cyan" }}
      title={
        <>
          Шукай <G tone="spark">словами</G>, а не назвами.
        </>
      }
      lead="Опиши файл так, як сказав би колезі. Спробуй сам."
    >
      <div data-reveal className="w-full max-w-[880px]">
        <SearchPanel />
      </div>
    </Section>
  );
}

/** Live semantic search demo: real input, autoplay typing until the visitor takes over.
 *  `bare`: no own card and no hints below (used inside the home stage card). */
export function SearchPanel({ active = true, bare = false }: { active?: boolean; bare?: boolean }) {
  const [query, setQuery] = useState("");
  const activeRef = useRef(active);
  activeRef.current = active;
  const [userControlled, setUserControlled] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // autoplay typing until the visitor interacts; pauses off-screen
  useEffect(() => {
    if (userControlled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setQuery(QUERIES[1]);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let qi = 0;
    let ci = 0;
    let erasing = false;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (boxRef.current) io.observe(boxRef.current);

    const tick = () => {
      if (!visible || !activeRef.current) {
        timer = setTimeout(tick, 400);
        return;
      }
      const target = QUERIES[qi];
      if (!erasing) {
        ci++;
        setQuery(target.slice(0, ci));
        if (ci >= target.length) {
          erasing = true;
          timer = setTimeout(tick, 3200);
          return;
        }
        timer = setTimeout(tick, 60 + Math.random() * 50);
      } else {
        ci = Math.max(0, ci - 4);
        setQuery(target.slice(0, ci));
        if (ci === 0) {
          erasing = false;
          qi = (qi + 1) % QUERIES.length;
          timer = setTimeout(tick, 600);
          return;
        }
        timer = setTimeout(tick, 24);
      }
    };
    timer = setTimeout(tick, 700);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [userControlled]);

  const results = useMemo(() => search(query), [query]);

  const takeOver = () => {
    if (userControlled) return;
    setUserControlled(true);
    setQuery("");
  };

  return (
      <div ref={boxRef} className="w-full text-left">
        <div className={bare ? "" : "card overflow-hidden"}>
          <div className="flex items-center gap-4 border-b border-hairline px-6 py-5">
            <MagnifyingGlass size={22} aria-hidden="true" className="shrink-0 text-cyan" />
            <label htmlFor="cs-search" className="sr-only">
              Пошук по архіву
            </label>
            <input
              id="cs-search"
              type="search"
              name="q"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onFocus={takeOver}
              onPointerDown={takeOver}
              onChange={(e) => {
                setUserControlled(true);
                setQuery(e.target.value);
              }}
              placeholder="Наприклад: відео з пляшкою на синьому фоні…"
              className="min-w-0 flex-1 bg-transparent text-[clamp(17px,1.6vw,22px)] tracking-[-0.015em] text-fg outline-none placeholder:text-grey"
            />
            {!userControlled && <span aria-hidden="true" className="caret -ml-3 h-6 w-px bg-blue" />}
          </div>

          <ul aria-live={userControlled ? "polite" : "off"} className="min-h-[264px] divide-y divide-hairline">
            {results.map(({ f, score }, i) => (
              <li key={f.name} className={`flex items-center gap-4 px-6 py-4 ${i === 0 ? "bg-white/[0.03]" : ""}`}>
                <span className="hidden w-16 shrink-0 sm:block">
                  <Tag color={EXT_COLOR[ext(f.name)]}>.{ext(f.name)}</Tag>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-fg">{f.name}</span>
                  <span className="block truncate text-[13px] text-grey">{f.meta}</span>
                </span>
                <span
                  className={`shrink-0 text-[15px] font-semibold tabular-nums ${i === 0 ? ACCENT.cyan.text : "text-body"}`}
                >
                  {score}%
                  <span className="ml-1 text-[12px] font-normal text-grey">збіг</span>
                </span>
              </li>
            ))}
            {query.trim() && results.length === 0 && (
              <li className="px-6 py-16 text-center text-[15px] text-grey">
                Нічого не знайшлося. Опиши колір, людину, об&apos;єкт або проєкт.
              </li>
            )}
            {!query.trim() && userControlled && (
              <li className="flex flex-wrap justify-center gap-2 px-6 py-14">
                {QUERIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuery(q)}
                    className="btn-secondary inline-flex h-11 items-center rounded-full px-4 text-[14px]"
                  >
                    {q}
                  </button>
                ))}
              </li>
            )}
          </ul>
        </div>
        {!bare && (
          <>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="legible mr-1 text-[14px] text-body">Розуміє:</span>
          {UNDERSTANDS.map((u) => (
            <Tag key={u.label} color={u.color}>
              {u.label}
            </Tag>
          ))}
        </div>
        <p className="legible mt-4 text-center text-[13px] text-grey">Демо на вигаданому архіві</p>
          </>
        )}
      </div>
  );
}
