import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Hotel Rajhans International Database...");

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "raj_int_hotel";

  // 1. Seed Super Admin User
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "rajhansinternational.info@gmail.com" },
    update: {
      passwordHash: adminPasswordHash,
    },
    create: {
      email: "rajhansinternational.info@gmail.com",
      name: "Hotel Administrator",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      phone: "+91 93081 89201",
    },
  });
  console.log("Created Super Admin user:", adminUser.email);

  // 3. Seed Rooms & Pricing
  const roomData = [
    {
      name: "Executive Room",
      slug: "executive-room",
      type: "EXECUTIVE" as const,
      description: "Good for solo travellers and short business trips.",
      capacity: 2,
      basePriceSingle: 3790,
      basePriceDouble: 4490,
      weekendPrice: null,
      holidayPrice: null,
      extraBedPrice: 500,
      taxPercentage: 12,
      status: "AVAILABLE" as const,
      displayOrder: 1,
      amenities: ["Standard Bed", "Study Table", "Fruit Basket", "TV", "Large Wardrobe", "A/C"],
      images: [
        { url: "/ranjhans/images/executive/Room-001.jpg", alt: "Executive Room Main", isPrimary: true },
      ],
    },
    {
      name: "Deluxe Room",
      slug: "deluxe-room",
      type: "DELUXE" as const,
      description: "More space and a pocket-spring bed.",
      capacity: 2,
      basePriceSingle: 3790,
      basePriceDouble: 4490,
      weekendPrice: 4890,
      holidayPrice: 5190,
      extraBedPrice: 600,
      taxPercentage: 12,
      status: "AVAILABLE" as const,
      displayOrder: 2,
      amenities: ["Pocket Spring Bed", "Study Table", "Fruit Basket", "TV", "Large Wardrobe", "A/C"],
      images: [
        { url: "/ranjhans/images/deluxe/Delux001.jpg", alt: "Deluxe Room Main", isPrimary: true },
      ],
    },
    {
      name: "Royal Suite",
      slug: "royal-suite",
      type: "ROYAL_SUITE" as const,
      description: "Separate bedroom and living room with two washrooms.",
      capacity: 4,
      basePriceSingle: 5190,
      basePriceDouble: 5190,
      weekendPrice: 5690,
      holidayPrice: 5990,
      extraBedPrice: 800,
      taxPercentage: 18,
      status: "AVAILABLE" as const,
      displayOrder: 3,
      amenities: ["Bedroom + Living Room", "Double Washroom", "Mini Fridge", "Study Table", "Sofa Seating Area", "Fruit Basket", "A/C"],
      images: [
        { url: "/ranjhans/images/suite/SR001.jpg", alt: "Royal Suite Living Room", isPrimary: true },
        { url: "/ranjhans/images/suite/SR002.jpg", alt: "Royal Suite Bedroom", isPrimary: false },
        { url: "/ranjhans/images/suite/SR005.jpg", alt: "Royal Suite Lounge", isPrimary: false },
      ],
    },
    {
      name: "Dormitory Hall",
      slug: "dormitory-hall",
      type: "DORMITORY" as const,
      description: "Economical group stay arrangement with individual lockers and clean beds.",
      capacity: 10,
      basePriceSingle: 800,
      basePriceDouble: 800,
      weekendPrice: 900,
      holidayPrice: 1000,
      extraBedPrice: 0,
      taxPercentage: 12,
      status: "AVAILABLE" as const,
      displayOrder: 4,
      amenities: ["Individual Lockers", "Air Conditioning", "Shared Bathrooms", "WiFi"],
      images: [
        { url: "/ranjhans/images/dormitory/DM005.jpg", alt: "Dormitory Hall", isPrimary: true },
        { url: "/ranjhans/images/dormitory/DM006.jpg", alt: "Dormitory Beds", isPrimary: false },
      ],
    },
  ];

  for (const r of roomData) {
    const { amenities, images, ...roomFields } = r;
    const room = await prisma.room.upsert({
      where: { slug: roomFields.slug },
      update: roomFields,
      create: roomFields,
    });

    // Delete old amenities & re-insert
    await prisma.roomAmenity.deleteMany({ where: { roomId: room.id } });
    for (const am of amenities) {
      await prisma.roomAmenity.create({
        data: { roomId: room.id, amenityName: am },
      });
    }

    // Delete old images & re-insert
    await prisma.roomImage.deleteMany({ where: { roomId: room.id } });
    for (const img of images) {
      await prisma.roomImage.create({
        data: { roomId: room.id, url: img.url, alt: img.alt, isPrimary: img.isPrimary },
      });
    }
  }
  console.log("Seeded Rooms & Amenities.");

  // 4. Seed Gallery Images
  const galleryData = [
    { url: "/ranjhans/images/reception/Reception001.jpg", category: "reception", alt: "Hotel lobby", size: "wide", displayOrder: 1 },
    { url: "/ranjhans/images/reception/Reception003.jpg", category: "reception", alt: "Lobby seating", size: "square", displayOrder: 2 },
    { url: "/ranjhans/images/reception/Reception005.jpg", category: "reception", alt: "Reception desk", size: "tall", displayOrder: 3 },
    { url: "/ranjhans/images/suite/SR001.jpg", category: "rooms", alt: "Royal suite living room", size: "wide", displayOrder: 4 },
    { url: "/ranjhans/images/suite/SR002.jpg", category: "rooms", alt: "Royal suite bedroom", size: "tall", displayOrder: 5 },
    { url: "/ranjhans/images/executive/Room-001.jpg", category: "rooms", alt: "Executive room", size: "square", displayOrder: 6 },
    { url: "/ranjhans/images/deluxe/Delux001.jpg", category: "rooms", alt: "Deluxe room", size: "square", displayOrder: 7 },
    { url: "/ranjhans/images/suite/SR005.jpg", category: "rooms", alt: "Royal suite lounge", size: "wide", displayOrder: 8 },
    { url: "/ranjhans/images/restaurant/R001.jpg", category: "restaurant", alt: "Takshshila restaurant", size: "wide", displayOrder: 9 },
    { url: "/ranjhans/images/restaurant/R004.jpg", category: "restaurant", alt: "Restaurant dining", size: "square", displayOrder: 10 },
    { url: "/ranjhans/images/restaurant/R005.jpg", category: "restaurant", alt: "Restaurant seating", size: "tall", displayOrder: 11 },
    { url: "/ranjhans/images/parlour/BP001.jpg", category: "services", alt: "Beauty parlour", size: "tall", displayOrder: 12 },
    { url: "/ranjhans/images/parlour/BP008.jpg", category: "services", alt: "Beauty parlour interior", size: "square", displayOrder: 13 },
    { url: "/ranjhans/images/ice-cream/ICP001.jpg", category: "icecream", alt: "Ice cream parlour", size: "wide", displayOrder: 14 },
    { url: "/ranjhans/images/ice-cream/ICP004.jpg", category: "icecream", alt: "Ice cream display", size: "square", displayOrder: 15 },
    { url: "/ranjhans/images/dormitory/DM005.jpg", category: "dormitory", alt: "Dormitory hall", size: "wide", displayOrder: 16 },
    { url: "/ranjhans/images/dormitory/DM006.jpg", category: "dormitory", alt: "Dormitory beds", size: "tall", displayOrder: 17 },
  ];

  await prisma.galleryImage.deleteMany();
  for (const g of galleryData) {
    await prisma.galleryImage.create({ data: g });
  }
  console.log("Seeded Gallery Images.");

  // 5. Seed FAQs
  const faqs = [
    { question: "Food & dining", answer: "Takshshila Restaurant serves Indian, Chinese, and continental dishes. Room service runs 24 hours. Ice & Spice is the in-house ice cream parlour.", displayOrder: 1 },
    { question: "Parking", answer: "Free parking on-site, monitored around the clock.", displayOrder: 2 },
    { question: "Railway station pickup", answer: "Pickup and drop can be arranged on request. Bhagalpur Railway Station is about 1.5 km away.", displayOrder: 3 },
    { question: "Location", answer: "Kachari Chowk, MG Road — near markets, district courts, banks, and government offices.", displayOrder: 4 },
    { question: "Pets", answer: "Pets are not allowed. Call ahead if you are travelling with a service animal.", displayOrder: 5 },
    { question: "WiFi & business needs", answer: "WiFi in all rooms. Printing and scanning available at the front desk.", displayOrder: 6 },
  ];

  await prisma.fAQ.deleteMany();
  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }

  // 6. Seed Reviews
  const reviews = [
    { authorName: "Mrinal Raj", authorInitials: "MR", rating: 5, reviewText: "Very well maintained. Support staff was extremely friendly. Even though it is located in the middle of the city, the hotel is peaceful and exceptionally maintained. The food is excellent, and cleanliness and guest service are outstanding.", source: "Google review", status: "FEATURED" as const },
    { authorName: "Rituraj Rathore", authorInitials: "RR", rating: 5, reviewText: "I stayed for two days. The ambience was wonderful, the staff were courteous, the rooms were clean, and the food was delicious. The tea served in an earthen pot was especially memorable.", source: "Google review", status: "FEATURED" as const },
  ];

  await prisma.review.deleteMany();
  for (const r of reviews) {
    await prisma.review.create({ data: r });
  }

  // 7. Seed System Settings
  const settings = [
    { key: "hotel_name", value: "Hotel Rajhans International", category: "general", description: "Official Hotel Name" },
    { key: "hotel_subtitle", value: "On MG Road, Kachari Chowk — rooms, dining, and parking on-site.", category: "general", description: "Hero Tagline" },
    { key: "company_name", value: "Takshshila Regency Pvt. Ltd.", category: "general", description: "Operating Company Name" },
    { key: "gstin", value: "10AAAAA0000A1Z5", category: "financial", description: "GSTIN Tax Number" },
    { key: "phone_primary", value: "+91 93081 89201", category: "contact", description: "Primary Contact Phone" },
    { key: "phone_landline", value: "+91 641 240 9411 / 12 / 13 / 14 / 15", category: "contact", description: "Landline Numbers" },
    { key: "email_official", value: "info@hotelrajhansinternational.com", category: "contact", description: "Official Email Address" },
    { key: "address_full", value: "Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001, India", category: "contact", description: "Hotel Full Address" },
    { key: "check_in_time", value: "12:00 PM", category: "policy", description: "Standard Check-in Time" },
    { key: "check_out_time", value: "11:00 AM", category: "policy", description: "Standard Check-out Time" },
    { key: "maps_iframe_url", value: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.113031023773!2d87.0052345!3d25.2499692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f04be66a0df017%3A0xe9f79b6999a9a38!2sHotel%20Rajhans%20International!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin", category: "cms", description: "Google Maps Embed URL" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: s,
      create: s,
    });
  }

  console.log("Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
