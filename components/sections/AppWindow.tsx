// Product visual 1 of 2: one calm window showing a file with its history and links.
// All names and numbers are fictional.
import type { Accent } from "../ui/accent";
import { ACCENT } from "../ui/accent";

const PROJECTS = ["Весна 26", "Сірий кит", "Годинники Час", "Архів 2025"];

const FILES = [
  { name: "spring_kv.psd", meta: "412 МБ", active: true },
  { name: "teaser_cut.mov", meta: "3,8 ГБ" },
  { name: "bottle_render.blend", meta: "1,1 ГБ" },
  { name: "brief_spring26.pdf", meta: "2,4 МБ" },
  { name: "moodboard.fig", meta: "86 МБ" },
];

const HISTORY = [
  { v: "v7", who: "Олеся Кравець", when: "сьогодні, 14:20", current: true },
  { v: "v6", who: "Тарас Мельник", when: "вчора" },
  { v: "v5", who: "Олеся Кравець", when: "10 березня" },
];

const LINKED: { name: string; rel: string; color: Accent }[] = [
  { name: "banner_1080x1920.png", rel: "Експорт", color: "cyan" },
  { name: "billboard_6x3.pdf", rel: "Експорт", color: "cyan" },
  { name: "Правки Ірини Гнатюк", rel: "6 коментарів", color: "violet" },
];

export function AppWindow() {
  return (
    <figure
      className="card w-full overflow-hidden text-left"
      aria-label="Інтерфейс Cloud Sphere: файл spring_kv.psd з історією версій і пов'язаними файлами"
    >
      <div className="flex h-11 items-center border-b border-hairline px-4">
        <span aria-hidden="true" className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto text-[13px] text-grey">Весна 26</span>
        <span className="w-[42px]" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[200px_280px_1fr]">
        <aside className="hidden border-r border-hairline p-4 md:block">
          <div className="px-2 text-[12px] text-grey">Проєкти</div>
          <ul className="mt-2 space-y-0.5">
            {PROJECTS.map((p, i) => (
              <li
                key={p}
                className={`rounded-lg px-2 py-1.5 text-[14px] ${i === 0 ? "bg-white/[0.06] text-fg" : "text-grey"}`}
              >
                {p}
              </li>
            ))}
          </ul>
        </aside>

        <div className="hidden border-r border-hairline p-4 lg:block">
          <div className="px-2 text-[12px] text-grey">Файли</div>
          <ul className="mt-2 space-y-0.5">
            {FILES.map((f) => (
              <li
                key={f.name}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[14px] ${
                  f.active ? "bg-white/[0.06] text-fg" : "text-grey"
                }`}
              >
                <span className="truncate">{f.name}</span>
                <span className="ml-3 shrink-0 text-[12px] text-grey">{f.meta}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="size-16 shrink-0 rounded-xl bg-[radial-gradient(circle_at_35%_35%,#9cc4ff,#3d8bff_45%,#0c1730)] sm:size-20"
            />
            <div className="min-w-0">
              <div className="truncate text-[18px] font-medium tracking-[-0.02em]">spring_kv.psd</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-grey">
                412 МБ
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green/12 px-3 py-1.5 text-[12px] font-semibold leading-none text-green">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-green" /> зашифровано
                </span>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-7 sm:grid-cols-2">
            <div>
              <div className="text-[12px] text-grey">Історія</div>
              <ul className="mt-3 space-y-3">
                {HISTORY.map((h) => (
                  <li key={h.v} className="flex items-baseline gap-3 text-[14px]">
                    <span className={`w-6 shrink-0 font-medium ${h.current ? "text-blue" : "text-grey"}`}>{h.v}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-fg">{h.who}</span>
                      <span className="block text-[12px] text-grey">{h.when}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[12px] text-grey">Пов&apos;язані</div>
              <ul className="mt-3 space-y-3">
                {LINKED.map((l) => (
                  <li key={l.name} className="flex items-center gap-3 text-[14px]">
                    <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${ACCENT[l.color].dot}`} />
                    <span className="min-w-0">
                      <span className="block truncate text-fg">{l.name}</span>
                      <span className={`block text-[12px] ${ACCENT[l.color].text}`}>{l.rel}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
