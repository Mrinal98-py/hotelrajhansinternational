import type { MetadataRoute } from "next";
import { HOTEL_INFO } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = HOTEL_INFO.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/images/",
          "/_next/static/",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/invoice/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/images/",
          "/_next/static/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/invoice/",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/images/",
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap.txt`,
    ],
    host: baseUrl,
  };
}
