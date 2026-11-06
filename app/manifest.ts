import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ABD Group",
    short_name: "ABD Group",
    description: "Raqamli yeçimlar studiyasi — veb, mobil, brending va CRM.",
    start_url: "/",
    display: "standalone",
    background_color: "#04060f",
    theme_color: "#04060f",
    icons: [
      { src: "/img/logo.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
