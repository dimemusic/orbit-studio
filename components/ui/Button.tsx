import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";
type Size = "lg" | "nav";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] " +
  "transition-[background-color,border-color,color,box-shadow] duration-200 ease-out";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  text: "text-body hover:text-fg",
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
  // big PRIMARY buttons share one minimum width (shrinks on narrow phones); secondary ones stay content-wide
  const wide = size === "lg" && variant === "primary" ? "min-w-[min(17rem,100%)]" : "";
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${wide} ${className}`;
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
