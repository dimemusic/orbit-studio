import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";
type Size = "lg" | "nav";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[var(--ease)] " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  text: "text-body hover:text-fg hover:translate-y-0",
};

const sizes: Record<Size, string> = {
  lg: "h-16 px-10 text-[17px]",
  nav: "h-12 px-6 text-[15px]",
};

type Common = { variant?: Variant; size?: Size; children: ReactNode; className?: string };
type AsLink = Common & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "lg", className = "", children, ...rest } = props;
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (rest.href !== undefined) {
    // internal routes ("/privacy", "/#contact") use client-side navigation; hashes and mailto stay plain links
    if (rest.href.startsWith("/")) {
      const { href, ...a } = rest as ComponentPropsWithoutRef<"a"> & { href: string };
      return (
        <Link href={href} className={cls} {...a}>
          {children}
        </Link>
      );
    }
    return (
      <a className={cls} {...(rest as ComponentPropsWithoutRef<"a">)}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {children}
    </button>
  );
}
