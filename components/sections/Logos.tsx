// Fictional studios, set as simple wordmarks in varied treatments.
const STUDIOS = [
  { name: "Пікселярня", cls: "font-semibold tracking-[-0.04em]" },
  { name: "ПІВНІЧ", cls: "font-medium tracking-[0.28em]" },
  { name: "optika lab", cls: "font-light tracking-[-0.02em]" },
  { name: "Кадр 24", cls: "font-bold tracking-[-0.03em]" },
  { name: "VARTA", cls: "font-semibold tracking-[0.12em]" },
  { name: "Сірий кит", cls: "font-normal italic tracking-[-0.02em]" },
];

/** Small studio strip under the hero promise. */
export function LogoStrip() {
  return (
    <div aria-label="Студії, які працюють у Cloud Sphere" role="group" className="w-full">
      {/* hug-content pill: padding around the text, thin border, soft glass so it reads over the particles */}
      <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[rgb(6_8_14/0.6)] px-4 py-2 text-[14px] text-body backdrop-blur-md">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-blue" />
        Понад 12 400 студій уже зберігають роботу в <span translate="no" className="text-fg">Cloud Sphere</span>
      </p>
      <ul className="mt-7 grid w-full grid-cols-2 items-center gap-x-6 gap-y-6 text-[clamp(16px,1.4vw,21px)] text-fg/50 sm:grid-cols-3 lg:flex lg:justify-between">
        {STUDIOS.map((s) => (
          <li key={s.name} className={`whitespace-nowrap ${s.cls}`}>
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
