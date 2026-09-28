# Hotel Rajhans International — HMS Master Architecture & Business Logic Documentation

> **System Name:** Hotel Rajhans International Hospitality Management System (HMS)  
> **Platform Version:** 0.1.1  
> **Target Framework:** Next.js 16 (App Router + Turbopack) & React 19  
> **Database:** PostgreSQL (Neon Serverless) via Prisma ORM v6.4.0  
> **Primary Payment Gateway:** Cashfree PG (Live Production)  
> **Authentication:** Stateless JWT (`jose` HS256) with RBAC & Middleware Proxy  
> **Deployment Environment:** Vercel Edge / Serverless Runtime  

---

## Table of Contents
1. [Executive Summary & System Overview](#1-executive-summary--system-overview)
2. [Complete Project Directory Structure](#2-complete-project-directory-structure)
3. [Database Architecture & Entity Relationships](#3-database-architecture--entity-relationships)
4. [Complete Business Logic & Core Engines](#4-complete-business-logic--core-engines)
   - [4.1 Room Tariff & Pricing Calculation Engine](#41-room-tariff--pricing-calculation-engine)
   - [4.2 Room Availability & Inventory Locking Engine](#42-room-availability--inventory-locking-engine)
   - [4.3 Booking Lifecycle & State Transitions](#43-booking-lifecycle--state-transitions)
   - [4.4 Cashfree Payment Gateway Integration Engine](#44-cashfree-payment-gateway-integration-engine)
   - [4.5 Post-Payment Settlement & Dispatch Flow](#45-post-payment-settlement--dispatch-flow)
   - [4.6 Transactional Email & Tax Invoice Engine](#46-transactional-email--tax-invoice-engine)
   - [4.7 Google Sheets Bi-Directional Synchronization](#47-google-sheets-bi-directional-synchronization)
   - [4.8 Location & Distance Approximation Engine](#48-location--distance-approximation-engine)
   - [4.9 Authentication & Role-Based Access Control (RBAC)](#49-authentication--role-based-access-control-rbac)
   - [4.10 CMS, Review Moderation & Audit Logging](#410-cms-review-moderation--audit-logging)
5. [Complete API Endpoints Catalog](#5-complete-api-endpoints-catalog)
6. [Frontend Architecture & Page Routes](#6-frontend-architecture--page-routes)
7. [Environment Variables Matrix](#7-environment-variables-matrix)
8. [Production Deployment & Operational Best Practices](#8-production-deployment--operational-best-practices)

---

## 1. Executive Summary & System Overview

Hotel Rajhans International HMS is an enterprise-grade full-stack hotel management and guest booking platform developed for Hotel Rajhans International (a unit of Takshshila Regency Pvt. Ltd., Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001).

### Architecture Diagram

```mermaid
graph TD
    Client[Guest Web Browser / Mobile User] -->|Browses Rooms, Reviews, FAQs| PublicFront[Next.js Public App /]
    Admin[Hotel Management / Receptionist] -->|Authenticates via JWT| AdminPanel[Admin Portal /admin/*]
    
    PublicFront -->|POST /api/bookings| BookingEngine[Booking & Inventory Engine]
    PublicFront -->|POST /api/payments/cashfree/*| CashfreeEngine[Cashfree PG Integration]
    
    AdminPanel -->|adminFetch with Auth Header| AdminAPIs[Protected Management APIs]
    
    BookingEngine -->|Read / Write| Prisma[Prisma ORM Client]
    AdminAPIs -->|Read / Write| Prisma
    
    Prisma -->|Pooled PostgreSQL Connection| NeonDB[(Neon Serverless PostgreSQL)]
    
    CashfreeEngine -->|Order Creation & Verification| CashfreeAPI[(Cashfree Live PG Servers)]
    CashfreeEngine -->|Webhook HMAC-SHA256| WebhookHandler[/api/payments/cashfree/webhook]
    
    CashfreeEngine -->|Verified Payment| Mailer[Nodemailer SMTP Dispatch]
    CashfreeEngine -->|Verified Payment| Sheets[Google Sheets Integration]
    
    Mailer -->|HTML Confirmation & Invoice| GuestInbox[Guest Email]
    Mailer -->|Instant Order Alert| HotelAdminInbox[info@hotelrajhansinternational.com]
    Sheets -->|Append Row A:L| GSheets[(Google Drive Spreadsheet)]
```

---

## 2. Complete Project Directory Structure

```
hotelrajhansinternational/
├── .github/
│   └── workflows/
│       └── ci.yml                 # CI validation pipeline (Next.js build & Prisma check)
├── prisma/
│   ├── schema.prisma              # Master PostgreSQL schema definitions
│   └── dev.db                     # Local fallback database (historical)
├── public/
│   ├── images/                    # High-res photography of rooms, suite, restaurant
│   │   ├── executive/
│   │   ├── deluxe/
│   │   ├── suite/
│   │   ├── restaurant/
│   │   └── parlour/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with Google Fonts, metadata, SEO
│   │   ├── page.tsx               # Public guest landing page (rooms, rates, FAQs, reviews)
│   │   ├── globals.css            # Custom luxury gold/cream theme tokens & Tailwind v4
│   │   ├── attraction/
│   │   │   └── page.tsx           # Tourist spots around Bhagalpur (Vikramshila, Mandar)
│   │   ├── gallery/
│   │   │   └── page.tsx           # Filterable media gallery
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Unified admin layout with navigation sidebar & RBAC guard
│   │   │   ├── login/page.tsx     # Super Admin / Staff credentials login form
│   │   │   ├── dashboard/page.tsx # Financial KPI metrics, occupancy charts, quick actions
│   │   │   ├── bookings/page.tsx  # Reservations table, check-in/out, filtering, invoice
│   │   │   ├── rooms/page.tsx     # Dynamic room rate editor, status toggle, amenities
│   │   │   ├── customers/page.tsx # CRM database: guest profiles, lifetime spends, visit count
│   │   │   ├── payments/page.tsx  # Cashfree audit trail, order IDs, manual payment reset
│   │   │   ├── reports/page.tsx   # Revenue reports, occupancy percentage, export to CSV
│   │   │   ├── cms/page.tsx       # Live content editor: address, contact emails, phone numbers
│   │   │   ├── reviews/page.tsx   # Guest review moderation: Approve, Feature, Reject
│   │   │   ├── messages/page.tsx  # Inquiries and contact submissions inbox
│   │   │   ├── gallery/page.tsx   # Admin gallery image uploader and organizer
│   │   │   └── settings/page.tsx  # Hotel policies, GSTIN, check-in/check-out timing
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts  # Issues signed JWT cookie and bearer token
│   │       │   ├── logout/route.ts # Clears session cookie
│   │       │   └── me/route.ts     # Validates current active session
│   │       ├── bookings/
│   │       │   ├── route.ts        # GET (filtered list) & POST (create pending reservation)
│   │       │   ├── [id]/route.ts   # GET single & PUT (update booking status)
│   │       │   └── check-availability/route.ts # Real-time date conflict validation
│   │       ├── payments/
│   │       │   ├── route.ts        # GET payment logs for admin audit trail
│   │       │   ├── reset/route.ts  # POST clears test payment logs and resets metrics
│   │       │   └── cashfree/
│   │       │       ├── create-order/route.ts   # Generates Cashfree PG order & session ID
│   │       │       ├── verify-payment/route.ts # Settles payment, updates DB, sends emails
│   │       │       └── webhook/route.ts        # Async Cashfree webhook HMAC verification
│   │       ├── rooms/
│   │       │   ├── route.ts        # GET all rooms with images/amenities & POST new room
│   │       │   └── [id]/route.ts   # GET, PUT (rates/status/amenities), DELETE room
│   │       ├── customers/route.ts  # GET search customers & PUT update profile notes
│   │       ├── cms/route.ts        # GET public site settings & PUT update CMS key-values
│   │       ├── contact/route.ts    # POST public inquiry & sync to Google Sheets
│   │       ├── reviews/route.ts    # GET approved reviews & POST new review submission
│   │       ├── reports/route.ts    # GET aggregated financial KPIs and revenue figures
│   │       ├── invoice/[id]/route.ts # GET renders printable HTML tax invoice
│   │       ├── gallery/route.ts    # GET gallery items & POST add media
│   │       ├── upload/route.ts     # POST image upload handler
│   │       └── location/
│   │           └── distance/route.ts # GET Haversine distance from Bhagalpur Junction
│   ├── components/
│   │   ├── BookingModal.tsx        # Guest booking modal with live pricing & Cashfree Web SDK
│   │   ├── LocationSection.tsx     # Interactive map, directions, railway distance
│   │   ├── AttractionsSection.tsx  # Bhagalpur historical and cultural landmarks
│   │   └── ImageGallery.tsx        # Lightbox image viewer
│   ├── lib/
│   │   ├── prisma.ts               # Singleton PrismaClient with Neon fallback & lambda cache
│   │   ├── auth.ts                 # JWT signing/verification (`jose`), password hashing (`bcrypt`)
│   │   ├── admin-fetch.ts          # Resilient fetch wrapper with Bearer token & no-store headers
│   │   ├── cashfree.ts             # Cashfree PG API client (orders, verification, webhook HMAC)
│   │   ├── mailer.ts               # Nodemailer SMTP transporter and email dispatcher
│   │   ├── invoice.ts              # HTML confirmation email & printable tax invoice templates
│   │   ├── googlesheets.ts         # Google Sheets API v4 integration via RSA Service Account
│   │   ├── location.ts             # Geographic coordinates & Haversine distance calculator
│   │   └── utils.ts                # Date overlap check, night calculation, reference generator
│   ├── proxy.ts                    # Edge Next.js middleware for admin authentication routing
│   └── types/
│       └── json2csv.d.ts           # Type declarations for CSV report export
├── .env                            # Production secrets (Neon, Cashfree, JWT, SMTP)
├── package.json                    # Dependencies and scripts (build, prisma generate)
├── tsconfig.json                   # TypeScript compiler configuration
└── next.config.ts                  # Next.js build parameters
```

---

## 3. Database Architecture & Entity Relationships

The data layer is powered by Neon Serverless PostgreSQL, managed through Prisma ORM.

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ AuditLog : creates
    Customer ||--o{ Booking : places
    Room ||--o{ Booking : reserves
    Room ||--o{ RoomImage : contains
    Room ||--o{ RoomAmenity : provides
    Room ||--o{ Availability : maintains
    Booking ||--o{ Payment : receives

    Room {
        string id PK
        string name
        string slug UK
        enum type
        float basePriceSingle
        float basePriceDouble
        float weekendPrice
        float holidayPrice
        float extraBedPrice
        float taxPercentage
        enum status
        int displayOrder
    }

    Customer {
        string id PK
        string name
        string phone UK
        string email
        int visitCount
        float totalSpent
        boolean vipStatus
    }

    Booking {
        string id PK
        string referenceId UK
        string customerId FK
        string roomId FK
        datetime checkIn
        datetime checkOut
        int guestsCount
        float totalAmount
        float taxAmount
        float discountAmount
        float netAmount
        float paidAmount
        enum status
    }

    Payment {
        string id PK
        string bookingId FK
        string cashfreeOrderId
        string cashfreePaymentId
        float amount
        string currency
        enum method
        enum status
        string gatewayResponse
    }

    Setting {
        string id PK
        string key UK
        string value
        string category
    }

    Review {
        string id PK
        string authorName
        string authorInitials
        int rating
        string reviewText
        enum status
    }
```

### Enumerations
- **`Role`**: `SUPER_ADMIN`, `MANAGER`, `RECEPTION`, `STAFF`
- **`RoomType`**: `EXECUTIVE`, `DELUXE`, `ROYAL_SUITE`, `DORMITORY`
- **`RoomStatus`**: `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `DEACTIVATED`
- **`BookingStatus`**: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`, `REFUNDED`
- **`PaymentStatus`**: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
- **`PaymentMethod`**: `UPI`, `CARD`, `NETBANKING`, `WALLET`, `CASH`
- **`ReviewStatus`**: `PENDING`, `APPROVED`, `REJECTED`, `FEATURED`
- **`MessageStatus`**: `UNREAD`, `READ`, `REPLIED`, `RESOLVED`

---

## 4. Complete Business Logic & Core Engines

### 4.1 Room Tariff & Pricing Calculation Engine
File: [src/app/api/bookings/route.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/api/bookings/route.ts) & [src/lib/utils.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/utils.ts)

1. **Duration Calculation**:
   $$\text{Nights} = \max\left(1, \left\lceil \frac{|\text{checkOut} - \text{checkIn}|}{1000 \times 60 \times 60 \times 24} \right\rceil\right)$$

2. **Occupancy Tier Rate**:
   $$\text{Rate Per Night} = \begin{cases} \text{room.basePriceDouble}, & \text{if guests} > 1 \\ \text{room.basePriceSingle}, & \text{if guests} \le 1 \end{cases}$$

3. **Tax & Net Amount Formula**:
   $$\text{Subtotal} = \text{Rate Per Night} \times \text{Nights}$$
   $$\text{Tax Amount (GST)} = \frac{\text{Subtotal} \times \text{room.taxPercentage}}{100}$$
   $$\text{Net Payable Amount} = \text{Subtotal} + \text{Tax Amount} - \text{Discount Amount}$$

---

### 4.2 Room Availability & Inventory Locking Engine
File: [src/app/api/bookings/route.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/api/bookings/route.ts) & [src/lib/utils.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/utils.ts)

1. **Status Guards**:
   - `DEACTIVATED`: Booking rejected immediately (`400 Bad Request`).
   - `OCCUPIED`: Booking rejected (`400 Bad Request`).
   - `MAINTENANCE`: Booking rejected (`400 Bad Request`).

2. **Auto-Cleanup of Abandoned Sessions**:
   - Before querying existing reservations, any booking in `PENDING` state older than 30 minutes is automatically set to `CANCELLED`:
     $$\text{createdAt} < (\text{Now} - 30\text{ minutes}) \implies \text{status} = \text{"CANCELLED"}$$

3. **Date Overlap Detection**:
   $$\text{isDateOverlap}(A_1, A_2, B_1, B_2) = (A_1 < B_2) \land (A_2 > B_1)$$
   If any active booking (`CONFIRMED` or `CHECKED_IN`) overlaps with the requested range, the request is rejected with `409 Conflict`.

4. **Session Resumption**:
   - If the same customer phone number has an active `PENDING` reservation for the room, the existing booking session is returned, allowing the guest to complete payment without duplicate entry errors.

---

### 4.3 Booking Lifecycle & State Transitions

```mermaid
stateDiagram-v2
    [*] --> PENDING: Guest submits booking form
    PENDING --> CANCELLED: Abandoned > 30 mins
    PENDING --> CONFIRMED: Cashfree payment verified (SUCCESS)
    CONFIRMED --> CHECKED_IN: Guest arrives at hotel reception
    CHECKED_IN --> CHECKED_OUT: Guest departs & settles extras
    CONFIRMED --> CANCELLED: Cancellation requested
    CANCELLED --> REFUNDED: Admin processes refund
    CHECKED_OUT --> [*]
    REFUNDED --> [*]
```

- **Reference ID Format**: `HRJ-YYYYMMDD-XXXX` (e.g. `HRJ-20260928-0021`). Generated sequentially based on total historical reservation count.
- **Customer CRM Linking**:
  - Automatically searches for customer by unique phone number.
  - If existing, increments `visitCount` and updates contact information.
  - If new, creates a new `Customer` profile.

---

### 4.4 Cashfree Payment Gateway Integration Engine
File: [src/lib/cashfree.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/cashfree.ts)

- **Endpoints**:
  - Production: `https://api.cashfree.com/pg`
  - Sandbox: `https://sandbox.cashfree.com/pg`
- **Order Initialization** (`POST /orders`):
  - Sends `order_id`, `order_amount`, `order_currency` (`INR`), `customer_details` (sanitized 10-digit phone, clean customer ID), and `order_meta.return_url`.
  - Receives `payment_session_id` used by frontend Cashfree Web SDK V3.
- **Checkout Modal**:
  - Loaded via `https://sdk.cashfree.com/js/v3/cashfree.js`.
  - Executed inside an in-page responsive modal (`redirectTarget: "_modal"`).

---

### 4.5 Post-Payment Settlement & Dispatch Flow
File: [src/app/api/payments/cashfree/verify-payment/route.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/api/payments/cashfree/verify-payment/route.ts)

```mermaid
sequenceDiagram
    participant Guest as Guest Browser
    participant API as /api/payments/cashfree/verify-payment
    participant CF as Cashfree PG Server
    participant DB as Neon Database
    participant Mail as SMTP Mailer
    participant GS as Google Sheets API

    Guest->>API: POST { bookingId, orderId }
    API->>CF: GET /orders/{orderId} & /payments
    CF-->>API: { order_status: "PAID", payment_status: "SUCCESS" }
    
    rect rgb(240, 248, 255)
        Note over API,DB: Atomic Prisma Transaction
        API->>DB: Upsert Payment (status = SUCCESS)
        API->>DB: Update Booking (status = CONFIRMED, paidAmount = netAmount)
    end
    
    par Async Dispatch
        API->>Mail: Send Confirmation HTML to Guest & Hotel Admin
        API->>GS: Append Row to Bookings Tab (Idempotent)
    end
    
    API-->>Guest: { success: true, status: "CONFIRMED", bookingReference }
```

1. **Idempotency Protection**: If `booking.status === "CONFIRMED"`, verification succeeds immediately without re-executing transactions.
2. **Atomic Transaction**: Ensures payment creation/update and booking confirmation succeed or fail together.

---

### 4.6 Transactional Email & Tax Invoice Engine
File: [src/lib/mailer.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/mailer.ts) & [src/lib/invoice.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/invoice.ts)

- **Dual Email Notification**:
  - Recipient 1: Guest email (if provided).
  - Recipient 2: Official Hotel Reception: `info@hotelrajhansinternational.com`
  - Recipient 3: Hotel Management: `rajhansinternational.info@gmail.com`
- **Email Contents**:
  - Booking Reference Badge & Verification Stamp
  - Check-in (12:00 PM) / Check-out (11:00 AM) Schedule
  - Itemized Tariff & GST breakdown
  - Hotel GSTIN (`10AAAAA0000A1Z5`)
  - Direct 1-click Google Maps Navigation Button
- **Tax Invoice (`/api/invoice/[id]`)**:
  - Renders a printable tax invoice adhering to Indian GST compliance.

---

### 4.7 Google Sheets Bi-Directional Synchronization
File: [src/lib/googlesheets.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/googlesheets.ts)

- **Authentication**: Generates self-signed RS256 JWT using Google Cloud Service Account private key and requests OAuth2 access token.
- **Deduplication**: Reads Column A (`Bookings!A:A`) to check if `bookingReference` already exists before appending.
- **Appended Row Format**:
  `[Booking ID, Booking Date, Guest Name, Phone, Email, Room, Check-in, Check-out, Guests, Amount, Payment Status, Booking Status]`

---

### 4.8 Location & Distance Approximation Engine
File: [src/lib/location.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/location.ts)

- **Hotel Coordinates**: `25.2505° N, 86.9887° E` (Kachari Chowk, MG Road)
- **Railway Station Coordinates**: `25.2435° N, 86.9743° E` (Bhagalpur Junction BGP)
- **Haversine Distance Formula**:
  $$a = \sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1) \cos(\text{lat}_2) \sin^2\left(\frac{\Delta \text{lng}}{2}\right)$$
  $$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$
  $$\text{Road Distance} \approx R \times c \times 1.3 \quad (\text{where } R = 6371\text{ km})$$
  Result: ~2.5 km (10-15 minute drive).

---

### 4.9 Authentication & Role-Based Access Control (RBAC)
File: [src/lib/auth.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/auth.ts) & [src/proxy.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/proxy.ts)

- **Token Construction**: Signed using `jose` with algorithm `HS256`, 7-day expiration, and 30-second clock tolerance.
- **Dual Transport**:
  1. `Cookie`: `rajhans_admin_token` (HTTP-only, Secure in production, SameSite: Lax).
  2. `Header`: `Authorization: Bearer <token>` for programmatic API requests.
- **Role Permissions**:
  - `SUPER_ADMIN`: Full access to CMS settings, financial reports, user management, and payment resets.
  - `MANAGER`: Room tariff updates, customer profile management, booking updates.
  - `RECEPTION`: View reservations, perform check-in/out, read-only reviews and inquiries.
  - `STAFF`: Basic read operations.
- **Edge Middleware Guard** (`src/proxy.ts`):
  - Any request to `/admin/*` (except `/admin/login`) without a valid JWT is redirected to `/admin/login`.
  - Authenticated sessions accessing `/admin/login` are automatically redirected to `/admin/dashboard`.

---

### 4.10 CMS, Review Moderation & Audit Logging
File: [src/app/api/cms/route.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/api/cms/route.ts) & [src/app/api/reviews/route.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/api/reviews/route.ts)

- **Dynamic CMS Settings**: Key-value settings table loaded dynamically by the public storefront:
  - `hotel_name`, `phone_primary`, `phone_landline`, `email_official`, `address_full`, `check_in_time`, `check_out_time`, `maps_iframe_url`.
- **Review Moderation**:
  - Public submissions start in `PENDING` status.
  - Admin approves or marks as `FEATURED` before they appear on the homepage.
- **Audit Logs**:
  - Sensitive operations (CMS updates, room deletions, payment resets) append an immutable record to the `AuditLog` table with timestamp and user ID.

---

## 5. Complete API Endpoints Catalog

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/rooms` | `GET` | Public | Returns all active rooms with images and amenities |
| `/api/rooms` | `POST` | Admin | Creates a new room category |
| `/api/rooms/[id]` | `GET` | Public | Returns room details by ID |
| `/api/rooms/[id]` | `PUT` | Admin | Updates pricing, capacity, amenities, or status |
| `/api/rooms/[id]` | `DELETE` | Super Admin | Removes a room category |
| `/api/bookings` | `GET` | Staff / Admin | Lists bookings filtered by status or search keyword |
| `/api/bookings` | `POST` | Public | Creates a new reservation session in `PENDING` state |
| `/api/bookings/[id]` | `GET` | Staff / Admin | Retrieves complete booking details |
| `/api/bookings/[id]` | `PUT` | Staff / Admin | Updates booking status (`CHECKED_IN`, `CANCELLED`, etc.) |
| `/api/bookings/check-availability` | `GET` | Public | Checks room availability for specified date range |
| `/api/payments` | `GET` | Admin | Lists all payment transaction audit records |
| `/api/payments/reset` | `POST` | Super Admin | Resets test payment records and resets financial metrics |
| `/api/payments/cashfree/create-order` | `POST` | Public | Initializes order on Cashfree PG and returns session ID |
| `/api/payments/cashfree/verify-payment` | `POST` | Public / Webhook | Verifies payment settlement and triggers confirmations |
| `/api/payments/cashfree/webhook` | `POST` | Cashfree | Asynchronous webhook handler with HMAC-SHA256 signature |
| `/api/cms` | `GET` | Public | Fetches global site settings, active FAQs, and reviews |
| `/api/cms` | `PUT` | Super Admin | Updates global hotel settings |
| `/api/contact` | `POST` | Public | Submits guest inquiry and syncs to Google Sheets |
| `/api/customers` | `GET` | Admin | Searches customer CRM database |
| `/api/reviews` | `GET` | Public | Retrieves approved guest reviews |
| `/api/reviews` | `POST` | Public | Submits a guest review for moderation |
| `/api/reports` | `GET` | Admin | Returns financial KPIs, revenue charts, and occupancy data |
| `/api/invoice/[id]` | `GET` | Public / Admin | Renders printable tax invoice |
| `/api/location/distance` | `GET` | Public | Returns distance calculation from Bhagalpur Junction |
| `/api/auth/login` | `POST` | Public | Authenticates admin credentials and sets session cookie |
| `/api/auth/logout` | `POST` | Admin | Clears authentication session cookie |
| `/api/auth/me` | `GET` | Admin | Returns currently logged-in user profile |

---

## 6. Frontend Architecture & Page Routes

### Public Pages
- **`/` (Homepage)**: Luxury gold/cream presentation with hero carousel, dynamic room rates, live availability badges, takshshila restaurant section, amenities, customer reviews, FAQs, and interactive Google Maps.
- **`/gallery`**: Interactive photo gallery classified into Reception, Executive Rooms, Deluxe Suites, Restaurant, and Parlour.
- **`/attraction`**: Guide to regional Bhagalpur tourist landmarks with distance and travel times.

### Admin Dashboard Pages (`/admin/*`)
- **`/admin/dashboard`**: Executive summary cards (Total Revenue, Confirmed Bookings, Available Rooms, Occupancy Rate), revenue area chart, today's movements, and quick action buttons.
- **`/admin/bookings`**: Reservation ledger with status filter tabs (`ALL`, `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`), guest search bar, status switcher, and direct PDF invoice links.
- **`/admin/rooms`**: Visual tariff editor for single/double base prices, status toggling (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`), and amenity configuration.
- **`/admin/payments`**: Audit ledger recording Cashfree Order IDs, Payment IDs, amounts, payment methods, and settlement status. Includes "Reset Payment Data" button.
- **`/admin/customers`**: Guest CRM showing lifetime visit count, total revenue per guest, contact phone/email, and notes.
- **`/admin/cms`**: Form controls to modify hotel address, official contact numbers, email addresses, and check-in/out policies without code redeployments.
- **`/admin/reviews`**: Review approval board to inspect, publish, or feature customer testimonials.
- **`/admin/messages`**: Contact inbox displaying inquiries with reply tools.

---

## 7. Environment Variables Matrix

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string with SSL | `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | **Yes** | Secret key for signing and verifying HS256 tokens | `super-secret-hotel-rajhans-jwt-key-2026-secure` |
| `NEXTAUTH_SECRET` | **Yes** | Fallback secret for session token signing | `super-secret-hotel-rajhans-jwt-key-2026-secure` |
| `CASHFREE_APP_ID` | **Yes** | Cashfree Live Production Client / App ID | `138094154884ce1eb76861254c91490831` |
| `CASHFREE_SECRET_KEY` | **Yes** | Cashfree Live Production Client Secret Key | `cfsk_ma_prod_03f7b49ec4143dbca5083b7b4acba0d5_...` |
| `CASHFREE_ENV` | **Yes** | Gateway environment (`PRODUCTION` or `SANDBOX`) | `PRODUCTION` |
| `CASHFREE_API_VERSION` | **Yes** | Cashfree API version header | `2023-08-01` |
| `SMTP_HOST` | Optional | SMTP mail host for transactional emails | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP mail port (587 for TLS, 465 for SSL) | `587` |
| `SMTP_USER` | Optional | Sender email account | `info@hotelrajhansinternational.com` |
| `SMTP_PASS` | Optional | SMTP application password | `app-password-here` |
| `SMTP_FROM` | Optional | Display name and sender address | `Hotel Rajhans International <info@hotelrajhansinternational.com>` |
| `GOOGLE_SHEET_ID` | Optional | Google Sheet ID for booking synchronization | `1abcXYZ...` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Optional | Service account email for Google Sheets API | `rajhans-sheets@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Optional | RSA Private key for Google OAuth2 token exchange | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----` |
| `NEXT_PUBLIC_APP_URL` | Optional | Canonical web URL of the deployed application | `https://hotelrajhansinternational.vercel.app` |

---

## 8. Production Deployment & Operational Best Practices

1. **Prisma Client Generation**:
   - The build script in `package.json` executes `prisma generate && next build`.
   - In serverless environments, Prisma instance pooling is maintained on `globalThis` to prevent connection exhaustion.
2. **Serverless Cache Invalidation**:
   - Dynamic API route handlers (`/api/rooms`, `/api/cms`, `/api/bookings`, `/api/payments`) declare:
     ```typescript
     export const dynamic = "force-dynamic";
     export const revalidate = 0;
     ```
   - All fetch operations across the admin panel utilize `adminFetch` with `cache: "no-store"` and `Cache-Control: no-cache` headers.
3. **Database Migration Policy**:
   - When modifying schema models, run `npx prisma db push` to synchronize Neon PostgreSQL without resetting live production data.
