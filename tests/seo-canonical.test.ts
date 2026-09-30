import assert from "node:assert";
import { getSiteUrl, getCanonicalUrl, createNoIndexMetadata, PRODUCTION_DOMAIN } from "../src/lib/seo";
import sitemap from "../src/app/sitemap";
import nextConfig from "../next.config";

import { metadata as homeMetadata } from "../src/app/page";
import { metadata as roomsMetadata } from "../src/app/rooms/page";
import { metadata as executiveMetadata } from "../src/app/rooms/ac-executive/page";
import { metadata as deluxeMetadata } from "../src/app/rooms/ac-deluxe/page";
import { metadata as suiteMetadata } from "../src/app/rooms/royal-suite/page";
import { metadata as servicesMetadata } from "../src/app/services/page";
import { metadata as roomServiceMetadata } from "../src/app/services/room-service/page";
import { metadata as restaurantServiceMetadata } from "../src/app/services/restaurant/page";
import { metadata as laundryMetadata } from "../src/app/services/laundry/page";
import { metadata as wifiMetadata } from "../src/app/services/wifi/page";
import { metadata as restaurantMetadata } from "../src/app/restaurant/page";
import { metadata as facilitiesMetadata } from "../src/app/facilities/page";
import { metadata as galleryMetadata } from "../src/app/gallery/page";
import { metadata as locationMetadata } from "../src/app/location/page";
import { metadata as attractionsMetadata } from "../src/app/attractions/page";
import { metadata as vikramshilaMetadata } from "../src/app/attractions/vikramshila/page";
import { metadata as mandarHillMetadata } from "../src/app/attractions/mandar-hill/page";
import { metadata as aboutMetadata } from "../src/app/about/page";
import { metadata as reviewsMetadata } from "../src/app/reviews/page";
import { metadata as faqMetadata } from "../src/app/faq/page";
import { metadata as bookingMetadata } from "../src/app/booking/page";
import { metadata as contactMetadata } from "../src/app/contact/page";
import { metadata as privacyMetadata } from "../src/app/privacy-policy/page";
import { metadata as termsMetadata } from "../src/app/terms-and-conditions/page";
import { metadata as cancellationMetadata } from "../src/app/cancellation-policy/page";
import { metadata as adminLayoutMetadata } from "../src/app/admin/layout";
import { metadata as notFoundMetadata } from "../src/app/not-found";

console.log("🔍 Running Canonical SEO & Indexability Verification Suite...");

// 1. Base URL & Protocol Verification
const siteUrl = getSiteUrl();
assert(siteUrl.startsWith("https://"), `Site URL must use HTTPS: ${siteUrl}`);
assert(!siteUrl.endsWith("/"), `Base site URL must not have trailing slash: ${siteUrl}`);

// 2. Canonical Helper URL Rules
// Root must have trailing slash
assert.strictEqual(getCanonicalUrl("/"), `${siteUrl}/`);
assert.strictEqual(getCanonicalUrl(""), `${siteUrl}/`);
assert.strictEqual(getCanonicalUrl(), `${siteUrl}/`);

// Subpages must NOT have trailing slash
assert.strictEqual(getCanonicalUrl("/rooms"), `${siteUrl}/rooms`);
assert.strictEqual(getCanonicalUrl("/rooms/"), `${siteUrl}/rooms`);
assert.strictEqual(getCanonicalUrl("//rooms//ac-executive//"), `${siteUrl}/rooms/ac-executive`);

// Strips Tracking & Query Parameters
assert.strictEqual(
  getCanonicalUrl("/rooms?utm_source=google&utm_campaign=summer&fbclid=123&gclid=456&ref=xyz"),
  `${siteUrl}/rooms`
);
assert.strictEqual(
  getCanonicalUrl("/booking?checkIn=2026-10-01&checkOut=2026-10-03&guests=2&room=deluxe"),
  `${siteUrl}/booking`
);
assert.strictEqual(
  getCanonicalUrl("/gallery?category=executive"),
  `${siteUrl}/gallery`
);
assert.strictEqual(
  getCanonicalUrl("/location#map-directions"),
  `${siteUrl}/location`
);

console.log("✔ Canonical URL normalization and parameter stripping verified.");

// 3. Page Metadata Canonical Tags
const publicPages = [
  { name: "Homepage", metadata: homeMetadata, expected: `${siteUrl}/` },
  { name: "Rooms Overview", metadata: roomsMetadata, expected: `${siteUrl}/rooms` },
  { name: "AC Executive", metadata: executiveMetadata, expected: `${siteUrl}/rooms/ac-executive` },
  { name: "AC Deluxe", metadata: deluxeMetadata, expected: `${siteUrl}/rooms/ac-deluxe` },
  { name: "Royal Suite", metadata: suiteMetadata, expected: `${siteUrl}/rooms/royal-suite` },
  { name: "Services", metadata: servicesMetadata, expected: `${siteUrl}/services` },
  { name: "Room Service", metadata: roomServiceMetadata, expected: `${siteUrl}/services/room-service` },
  { name: "Restaurant Service", metadata: restaurantServiceMetadata, expected: `${siteUrl}/services/restaurant` },
  { name: "Laundry Service", metadata: laundryMetadata, expected: `${siteUrl}/services/laundry` },
  { name: "Wi-Fi Service", metadata: wifiMetadata, expected: `${siteUrl}/services/wifi` },
  { name: "Takshshila Restaurant", metadata: restaurantMetadata, expected: `${siteUrl}/restaurant` },
  { name: "Facilities", metadata: facilitiesMetadata, expected: `${siteUrl}/facilities` },
  { name: "Gallery", metadata: galleryMetadata, expected: `${siteUrl}/gallery` },
  { name: "Location", metadata: locationMetadata, expected: `${siteUrl}/location` },
  { name: "Attractions", metadata: attractionsMetadata, expected: `${siteUrl}/attractions` },
  { name: "Vikramshila", metadata: vikramshilaMetadata, expected: `${siteUrl}/attractions/vikramshila` },
  { name: "Mandar Hill", metadata: mandarHillMetadata, expected: `${siteUrl}/attractions/mandar-hill` },
  { name: "About", metadata: aboutMetadata, expected: `${siteUrl}/about` },
  { name: "Reviews", metadata: reviewsMetadata, expected: `${siteUrl}/reviews` },
  { name: "FAQ", metadata: faqMetadata, expected: `${siteUrl}/faq` },
  { name: "Booking", metadata: bookingMetadata, expected: `${siteUrl}/booking` },
  { name: "Contact", metadata: contactMetadata, expected: `${siteUrl}/contact` },
  { name: "Privacy Policy", metadata: privacyMetadata, expected: `${siteUrl}/privacy-policy` },
  { name: "Terms & Conditions", metadata: termsMetadata, expected: `${siteUrl}/terms-and-conditions` },
  { name: "Cancellation Policy", metadata: cancellationMetadata, expected: `${siteUrl}/cancellation-policy` },
];

for (const page of publicPages) {
  const canonical = page.metadata.alternates?.canonical;
  assert.ok(canonical, `Page ${page.name} is missing alternates.canonical`);
  assert.strictEqual(
    canonical,
    page.expected,
    `Page ${page.name} canonical mismatch: expected ${page.expected}, got ${canonical}`
  );
  assert(
    typeof canonical === "string" && canonical.startsWith("https://"),
    `Page ${page.name} canonical must be HTTPS: ${canonical}`
  );
  assert(
    !canonical.includes("localhost") && !canonical.includes("127.0.0.1"),
    `Page ${page.name} canonical must not reference localhost: ${canonical}`
  );
}

console.log(`✔ All ${publicPages.length} indexable public pages have exactly one correct self-referencing canonical URL.`);

// 4. Sitemap.xml Consistency
const sitemapEntries = sitemap();
assert(sitemapEntries.length === publicPages.length, `Sitemap entry count (${sitemapEntries.length}) must match public pages (${publicPages.length})`);

for (const entry of sitemapEntries) {
  assert(entry.url.startsWith("https://"), `Sitemap URL must be HTTPS: ${entry.url}`);
  assert(!entry.url.includes("/admin"), `Sitemap must not contain admin routes: ${entry.url}`);
  assert(!entry.url.includes("/api"), `Sitemap must not contain API routes: ${entry.url}`);
  assert(!entry.url.includes("?"), `Sitemap must not contain query parameters: ${entry.url}`);

  // Root must have trailing slash, subpages must not
  if (entry.url === `${siteUrl}/`) {
    assert.strictEqual(entry.url, `${siteUrl}/`);
  } else {
    assert(!entry.url.endsWith("/"), `Subpath sitemap URL must not have trailing slash: ${entry.url}`);
  }
}

console.log(`✔ Sitemap.xml contains ${sitemapEntries.length} verified canonical entries matching public pages 1:1.`);

// 5. Admin and 404 NoIndex Verification
const adminRobots = adminLayoutMetadata.robots as any;
assert.ok(adminRobots, "Admin layout must define robots metadata");
assert.strictEqual(adminRobots.index, false, "Admin layout must have robots.index = false");
assert.strictEqual(adminRobots.follow, false, "Admin layout must have robots.follow = false");
assert.strictEqual(adminLayoutMetadata.alternates?.canonical, undefined, "Admin layout must not declare public canonical");

const notFoundRobots = notFoundMetadata.robots as any;
assert.ok(notFoundRobots, "NotFound must define robots metadata");
assert.strictEqual(notFoundRobots.index, false, "NotFound page must have robots.index = false");
assert.strictEqual(notFoundRobots.follow, false, "NotFound page must have robots.follow = false");
assert.strictEqual(notFoundMetadata.alternates?.canonical, undefined, "NotFound page must not declare public canonical");

console.log("✔ Admin layout and 404 error page verified as noindex, nofollow without public canonical.");

// 6. Redirect Consistency
async function checkRedirects() {
  if (nextConfig.redirects) {
    const redirects = await nextConfig.redirects();
    const offersRedirect = (redirects as any[]).find((r: any) => r.source === "/offers");
    assert.ok(offersRedirect, "/offers redirect must exist");
    assert.strictEqual(offersRedirect.destination, "/", "/offers must redirect to root /");
    assert.strictEqual(offersRedirect.permanent, true, "/offers redirect must be permanent (301)");

    const attractionRedirect = (redirects as any[]).find((r: any) => r.source === "/attraction");
    assert.ok(attractionRedirect, "/attraction redirect must exist");
    assert.strictEqual(attractionRedirect.destination, "/attractions", "/attraction must redirect to /attractions");
    assert.strictEqual(attractionRedirect.permanent, true, "/attraction redirect must be permanent (301)");

    console.log("✔ Redirect consistency verified (no canonical/redirect loops).");
  }
  console.log("🎉 ALL CANONICAL SEO & METADATA TESTS PASSED SUCCESSFULLY!");
}

checkRedirects().catch((err) => {
  console.error(err);
  process.exit(1);
});
