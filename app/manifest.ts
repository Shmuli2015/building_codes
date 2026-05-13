import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "קודי בניין — חיפוש קוד כניסה לפי כתובת",
    short_name: "קודי בניין",
    description:
      "חיפוש קוד כניסה לבניין לפי רחוב ומספר בית. ממשק בעברית.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    lang: "he",
    dir: "rtl",
    icons: [
      {
        src: "/icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
