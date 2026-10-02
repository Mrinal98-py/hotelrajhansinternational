import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const publicRoutes: {
    path: string;
    changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
  }[] = [
    { path: "/", changeFrequency: "daily", priority: 1.0 },
    { path: "/rooms", changeFrequency: "daily", priority: 0.9 },
    { path: "/rooms/ac-executive", changeFrequency: "weekly", priority: 0.9 },
    { path: "/rooms/ac-deluxe", changeFrequency: "weekly", priority: 0.9 },
    { path: "/rooms/royal-suite", changeFrequency: "weekly", priority: 0.9 },
    { path: "/services", changeFrequency: "weekly", priority: 0.8 },
    { path: "/services/beauty-parlour", changeFrequency: "weekly", priority: 0.7 },
    { path: "/services/saloon", changeFrequency: "weekly", priority: 0.7 },
    { path: "/services/room-service", changeFrequency: "weekly", priority: 0.7 },
    { path: "/services/restaurant", changeFrequency: "weekly", priority: 0.7 },
    { path: "/services/laundry", changeFrequency: "weekly", priority: 0.7 },
    { path: "/services/wifi", changeFrequency: "weekly", priority: 0.7 },
    { path: "/restaurant", changeFrequency: "weekly", priority: 0.8 },
    { path: "/facilities", changeFrequency: "monthly", priority: 0.8 },
    { path: "/gallery", changeFrequency: "monthly", priority: 0.8 },
    { path: "/location", changeFrequency: "monthly", priority: 0.8 },
    { path: "/attractions", changeFrequency: "monthly", priority: 0.8 },
    { path: "/attractions/vikramshila", changeFrequency: "monthly", priority: 0.8 },
    { path: "/attractions/mandar-hill", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/reviews", changeFrequency: "weekly", priority: 0.7 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
    { path: "/booking", changeFrequency: "daily", priority: 0.9 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
    { path: "/cancellation-policy", changeFrequency: "monthly", priority: 0.5 },
  ];

  return publicRoutes.map((route) => ({
    url: getCanonicalUrl(route.path),
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
