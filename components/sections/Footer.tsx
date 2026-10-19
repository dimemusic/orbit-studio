import Link from "next/link";

const LINKS = [
  ["Як це працює", "/#how"],
  ["Можливості", "/features"],
  ["Аналітика", "/analytics"],
  ["Безпека", "/security"],
  ["Тарифи", "/#pricing"],
  ["FAQ", "/#faq"],
];

export function Footer() {
  return (
    <footer
      className="card relative w-full overflow-hidden rounded-none border-x-0 border-b-0 px-gutter pb-10 pt-16 text-center shadow-none"
    >
      <nav aria-label="Посилання у футері">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-1">
          {LINKS.map(([label, href]) => (
            <li key={label}>
              <Link href={href} className="inline-block py-2 text-[14px] text-body transition-colors hover:text-fg">
                {label}
              </Link>
            </li>
          ))}
          <li>
            <a href="mailto:hello@cloudsphere.example" className="inline-block py-2 text-[14px] text-body transition-colors hover:text-fg">
              Написати нам
            </a>
          </li>
        </ul>
      </nav>

      <p className="mt-10 text-[14px] text-body">
        © 2026 <span translate="no">Cloud Sphere</span> · Зроблено у Львові
      </p>
      <p className="mt-1 text-[13px] text-grey">Дизайн-концепт · Максим</p>

    </footer>
  );
}
