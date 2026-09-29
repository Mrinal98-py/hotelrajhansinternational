export const HOTEL_INFO = {
  name: "Hotel Rajhans International",
  legalName: "Takshshila Regency Pvt. Ltd.",
  description: "Premier luxury hotel in Bhagalpur, Bihar offering AC Executive, AC Deluxe, and Royal Suite rooms, fine dining at Takshshila Restaurant, 24/7 room service, banquet hall, and secure on-site parking at Kachari Chowk, MG Road.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://hotelrajhansinternational.com",
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

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${HOTEL_INFO.url}${cleanPath}`;
}

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

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${HOTEL_INFO.url}${item.url}`,
    })),
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
