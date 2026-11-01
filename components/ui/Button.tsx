import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";
type Size = "lg" | "nav";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[-0.01em]";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  text: "text-body transition-colors duration-200 hover:text-fg",
};

// fixed whole-pixel boxes (asked: no 184.86 × 48): the width never follows the text.
// A `w-…` in className (w-full, w-36) replaces the default width.
const sizes: Record<Size, string> = {
  lg: "h-16 px-6 text-base",
  nav: "h-12 px-4 text-sm",
};
const widths: Record<Size, string> = { lg: "w-64", nav: "w-48" };

type Common = { variant?: Variant; size?: Size; children: ReactNode; className?: string };
type AsLink = Common & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "lg", className = "", children, ...rest } = props;
  const wide = variant === "text" || /(^|\s)(max-)?w-/.test(className) ? "" : widths[size];
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
