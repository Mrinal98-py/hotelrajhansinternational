import type { Metadata } from "next";

export const PRODUCTION_DOMAIN = "https://hotelrajhansinternational.com";

/**
 * Get sanitized base URL from environment variables.
 * Priority: NEXT_PUBLIC_SITE_URL > NEXT_PUBLIC_APP_URL > PRODUCTION_DOMAIN
 */
export function getSiteUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    PRODUCTION_DOMAIN;

  let url = envUrl.trim();

  // If in production mode or if env URL points to local, ensure production domain is used for canonical SEO
  if (
    process.env.NODE_ENV === "production" &&
    (url.includes("localhost") || url.includes("127.0.0.1") || url.includes(".vercel.app"))
  ) {
    url = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_DOMAIN;
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Remove trailing slashes from base URL
  return url.replace(/\/+$/, "");
}

/**
 * Returns exact canonical URL according to SEO rules:
 * - Root path -> https://hotelrajhansinternational.com/ (with trailing slash)
 * - Subpaths -> https://hotelrajhansinternational.com/path (NO trailing slash)
 * - Strips query parameters (?utm_source=..., ?category=..., ?checkIn=...)
 * - Strips hash anchors (#...)
 * - Collapses duplicate slashes
 */
export function getCanonicalUrl(path?: string): string {
  const siteUrl = getSiteUrl();

  if (!path || path === "/" || path.trim() === "") {
    return `${siteUrl}/`;
  }

  // Strip query string and hash
  const pathWithoutQuery = path.split("?")[0].split("#")[0].trim();

  // Collapse multiple slashes
  const collapsed = pathWithoutQuery.replace(/\/+/g, "/");

  // Remove leading and trailing slashes for subpaths
  const trimmed = collapsed.replace(/^\/+/, "").replace(/\/+$/, "");

  if (!trimmed) {
    return `${siteUrl}/`;
  }

  return `${siteUrl}/${trimmed}`;
}

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  image,
}: PageMetadataOptions): Metadata {
  const canonical = getCanonicalUrl(path);
  const siteUrl = getSiteUrl();
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`
    : `${siteUrl}/images/reception/Reception001.jpg`;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: HOTEL_INFO.name,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 800,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function createNoIndexMetadata(title?: string): Metadata {
  return {
    title: title ? `${title} | HMS Admin` : "Admin Console | Hotel Rajhans International",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const HOTEL_INFO = {
  name: "Hotel Rajhans International",
  legalName: "Takshshila Regency Pvt. Ltd.",
  description: "Premier luxury hotel in Bhagalpur, Bihar offering AC Executive, AC Deluxe, and Royal Suite rooms, fine dining at Takshshila Restaurant, 24/7 room service, banquet hall, and secure on-site parking at Kachari Chowk, MG Road.",
  url: getSiteUrl(),
  telephone: "+91 93081 89201",
  telephoneLandline: "+91 641 240 9411",
  email: "info@hotelrajhansinternational.com",
  address: {
    streetAddress: "Kachari Chowk, MG Road",
    addressLocality: "Bhagalpur",
    addressRegion: "Bihar",
    postalCode: "812001",
    addressCountry: "IN",
  },
  geo: {
    latitude: 25.2499692,
    longitude: 87.0052345,
  },
  priceRange: "₹₹₹ (₹3,790 - ₹5,190 per night)",
  checkInTime: "12:00",
  checkOutTime: "11:00",
  rating: {
    ratingValue: "4.5",
    reviewCount: "120",
  },
  images: [
    "/images/reception/Reception001.jpg",
    "/images/suite/SR001.jpg",
    "/images/executive/Room-001.jpg",
    "/images/deluxe/Delux001.jpg",
    "/images/restaurant/R001.jpg",
  ],
};

export function generateHotelSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "@id": `${HOTEL_INFO.url}/#hotel`,
    name: HOTEL_INFO.name,
    legalName: HOTEL_INFO.legalName,
    description: HOTEL_INFO.description,
    url: HOTEL_INFO.url,
    telephone: HOTEL_INFO.telephone,
    email: HOTEL_INFO.email,
    priceRange: HOTEL_INFO.priceRange,
    checkinTime: HOTEL_INFO.checkInTime,
    checkoutTime: HOTEL_INFO.checkOutTime,
    address: {
      "@type": "PostalAddress",
      streetAddress: HOTEL_INFO.address.streetAddress,
      addressLocality: HOTEL_INFO.address.addressLocality,
      addressRegion: HOTEL_INFO.address.addressRegion,
      postalCode: HOTEL_INFO.address.postalCode,
      addressCountry: HOTEL_INFO.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: HOTEL_INFO.geo.latitude,
      longitude: HOTEL_INFO.geo.longitude,
    },
    hasMap: "https://maps.google.com/?q=Hotel+Rajhans+International+Bhagalpur",
    image: HOTEL_INFO.images.map((img) => `${HOTEL_INFO.url}${img}`),
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Air Conditioning", value: true },
      { "@type": "LocationFeatureSpecification", name: "Takshshila Restaurant", value: true },
      { "@type": "LocationFeatureSpecification", name: "24-Hour Room Service", value: true },
      { "@type": "LocationFeatureSpecification", name: "Free Monitored Parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "24-Hour Front Desk", value: true },
      { "@type": "LocationFeatureSpecification", name: "Laundry & Dry Cleaning", value: true },
    ],
    starRating: {
      "@type": "Rating",
      ratingValue: "3",
    },
  };
}

export function generateRoomSchema(room: {
  name: string;
  description: string;
  url: string;
  image: string;
  priceSingle: number;
  priceDouble: number;
  occupancy: number;
  bedType: string;
  amenities: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: room.description,
    url: `${HOTEL_INFO.url}${room.url}`,
    image: `${HOTEL_INFO.url}${room.image}`,
    bed: {
      "@type": "BedDetails",
      typeOfBed: room.bedType,
      numberOfBeds: 1,
    },
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: room.occupancy,
      unitCode: "C62",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: room.priceSingle,
      highPrice: room.priceDouble,
      offerCount: 1,
      availability: "https://schema.org/InStock",
    },
    amenityFeature: room.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
      value: true,
    })),
    partOfTrip: {
      "@type": "Hotel",
      name: HOTEL_INFO.name,
      url: HOTEL_INFO.url,
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url?: string }[],
  currentPath?: string
) {
  const baseUrl = HOTEL_INFO.url.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      const rawPath = item.url || (isLast && currentPath ? currentPath : "");
      const cleanPath = rawPath
        ? rawPath.startsWith("/")
          ? rawPath
          : `/${rawPath}`
        : "/";
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${baseUrl}${cleanPath === "/" ? "" : cleanPath}`,
      };
    }),
  };
}

export function generateRestaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${HOTEL_INFO.url}/restaurant/#restaurant`,
    name: "Takshshila Restaurant",
    parentOrganization: {
      "@type": "Hotel",
      name: HOTEL_INFO.name,
      url: HOTEL_INFO.url,
    },
    image: `${HOTEL_INFO.url}/images/restaurant/R001.jpg`,
    telephone: HOTEL_INFO.telephone,
    email: HOTEL_INFO.email,
    servesCuisine: ["North Indian", "Chinese", "Mughlai", "Continental", "Traditional Bihari Thali"],
    priceRange: "₹₹ (₹300 - ₹800 per person)",
    address: {
      "@type": "PostalAddress",
      streetAddress: HOTEL_INFO.address.streetAddress,
      addressLocality: HOTEL_INFO.address.addressLocality,
      addressRegion: HOTEL_INFO.address.addressRegion,
      postalCode: HOTEL_INFO.address.postalCode,
      addressCountry: HOTEL_INFO.address.addressCountry,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "07:00",
        closes: "23:00",
      },
    ],
  };
}

export function generateFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
