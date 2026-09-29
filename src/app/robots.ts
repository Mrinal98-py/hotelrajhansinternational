import type { MetadataRoute } from "next";
import { HOTEL_INFO } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/admin/login",
        ],
      },
    ],
    sitemap: `${HOTEL_INFO.url}/sitemap.xml`,
  };
}
