import type { MetadataRoute } from "next";
import { HOTEL_INFO } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = HOTEL_INFO.url;
  const currentDate = new Date();

  const publicRoutes: {
    url: string;
    lastModified?: Date;
    changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
  }[] = [
    { url: `${baseUrl}`, lastModified: currentDate, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/rooms`, lastModified: currentDate, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/rooms/ac-executive`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/rooms/ac-deluxe`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/rooms/royal-suite`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/services/room-service`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/services/restaurant`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/services/laundry`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/services/wifi`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/restaurant`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/facilities`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/location`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/attractions`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/attractions/vikramshila`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/attractions/mandar-hill`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/reviews`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/offers`, lastModified: currentDate, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/booking`, lastModified: currentDate, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-and-conditions`, lastModified: currentDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cancellation-policy`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
  ];

  return publicRoutes;
}
