import type { MetadataRoute } from "next";

/** web app manifest: name, colours and icons for «add to home screen» and browser UI */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MaxArt Digital",
    short_name: "MaxArt",
    description: "Розробка сайтів під ключ: дизайн, розробка й адмін-панель.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#05070d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
