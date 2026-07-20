import type { MetadataRoute } from "next";
import site from "@/content/site.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.siteName,
    short_name: site.brandDisplayName,
    start_url: "/",
    display: "standalone",
    background_color: "#071739",
    theme_color: "#071739",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
