# Hotel Rajhans International — HMS Master Architecture & Business Logic Documentation

> **System Name:** Hotel Rajhans International Hospitality Management System (HMS)  
> **Platform Version:** 0.2.0 (Enterprise Tape Chart & Dynamic Folio Edition)  
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
   - [3.1 Physical Room Inventory Hierarchy](#31-physical-room-inventory-hierarchy)
   - [3.2 Entity Relationship Diagram](#32-entity-relationship-diagram)
   - [3.3 Enumerations Reference](#33-enumerations-reference)
4. [Complete Business Logic & Core Engines](#4-complete-business-logic--core-engines)
   - [4.1 Room Tariff & Pricing Calculation Engine](#41-room-tariff--pricing-calculation-engine)
   - [4.2 Concurrency-Safe Sequence Reference Generator](#42-concurrency-safe-sequence-reference-generator)
   - [4.3 Physical Room Inventory Calendar & Tape Chart Engine](#43-physical-room-inventory-calendar--tape-chart-engine)
   - [4.4 Concurrency Double-Booking Protection & Atomic Room Allocation](#44-concurrency-double-booking-protection--atomic-room-allocation)
   - [4.5 Reservation Lifecycle & Finite State Machine (FSM)](#45-reservation-lifecycle--finite-state-machine-fsm)
   - [4.6 Cashfree Payment Gateway & Unified Confirmation Pipeline](#46-cashfree-payment-gateway--unified-confirmation-pipeline)
   - [4.7 Dynamic Billing Folio Ledger & Split Payments](#47-dynamic-billing-folio-ledger--split-payments)
   - [4.8 Front Desk Operations & Walk-in Bookings](#48-front-desk-operations--walk-in-bookings)
   - [4.9 Housekeeping & Maintenance Workflows](#49-housekeeping--maintenance-workflows)
   - [4.10 Transactional Email & Tax Invoice Engine](#410-transactional-email--tax-invoice-engine)
   - [4.11 Google Sheets Bi-Directional Synchronization](#411-google-sheets-bi-directional-synchronization)
   - [4.12 Location & Distance Engine](#412-location--distance-engine)
   - [4.13 Security, RBAC & Outbox Pattern Event Dispatching](#413-security-rbac--outbox-pattern-event-dispatching)
5. [Complete API Endpoints Catalog](#5-complete-api-endpoints-catalog)
6. [Frontend Architecture & Page Routes](#6-frontend-architecture--page-routes)
7. [Automated Testing Suite (8 Suites)](#7-automated-testing-suite-8-suites)
8. [Environment Variables Matrix](#8-environment-variables-matrix)
9. [Production Deployment & Operational Best Practices](#9-production-deployment--operational-best-practices)

---

## 1. Executive Summary & System Overview

Hotel Rajhans International HMS is an enterprise-grade full-stack hotel management and guest booking platform developed for **Hotel Rajhans International** (a unit of Takshshila Regency Pvt. Ltd., Kachari Chowk, MG Road, Bhagalpur, Bihar – 812001).

The architecture couples a high-converting public storefront with a multi-departmental hotel management back-office featuring:
- **Physical Room Tape Chart Calendar**: 33 physical rooms across 3 categories with Month/Year/Date navigation, drag-and-drop room blocks, and live occupancy rates.
- **Atomic Concurrency Protection**: High-throughput row-level locking (`SELECT ... FOR UPDATE`) preventing double-bookings.
- **Dynamic Folio Ledger**: Itemized charges (room, restaurant/F&B, laundry, damage), partial/split payments, and automated zero-balance settlement.
- **Unified Payment Engine**: Resilient Cashfree integration with signature verification, webhook processing, audit logging, outbox queueing, and guest/admin alerts.
- **Departmental Modules**: Front Desk walk-in, Housekeeping task assignments, Maintenance work orders, Cashier shift closures, and CRM analytics.

### Architecture Diagram

```mermaid
graph TD
    Client[Guest Web Browser / Mobile User] -->|Browses Rooms, Reviews, FAQs| PublicFront[Next.js Public App /]
    Admin[Staff / Receptionist / Manager] -->|Authenticates via JWT| AdminPanel[Admin Portal /admin/*]
    
    PublicFront -->|POST /api/bookings| BookingEngine[Booking & Sequence Engine]
    PublicFront -->|POST /api/payments/cashfree/*| CashfreeEngine[Cashfree PG Integration]
    
    AdminPanel -->|Tape Chart / Room Plan| TapeChart[/admin/room-inventory]
    AdminPanel -->|Front Desk / Walk-in| FrontDesk[/admin/front-desk]
    AdminPanel -->|Dynamic Folio Ledger| FolioEngine[/admin/folios]
    AdminPanel -->|Cashier Shifts| Cashier[/admin/cashier]
    AdminPanel -->|Housekeeping & Maintenance| Ops[/admin/housekeeping & maintenance]
    
    CashfreeEngine -->|Verification / Webhook| UnifiedPayment[confirmBookingPayment Engine]
    
    UnifiedPayment -->|Atomic Room Allocation| InvEngine[Physical Room Allocation Engine]
    UnifiedPayment -->|Auto-Post Payment Item| FolioEngine
    UnifiedPayment -->|Audit Record| AuditTrail[(AuditLog Table)]
    UnifiedPayment -->|Transactional Event| Outbox[(OutboxEvent Table)]
    
    BookingEngine -->|Read / Write| Prisma[Prisma ORM Client]
    UnifiedPayment -->|Read / Write| Prisma
    
    Prisma -->|Pooled PostgreSQL Connection| NeonDB[(Neon Serverless PostgreSQL)]
    
    UnifiedPayment -.->|Async Non-Blocking| Mailer[Nodemailer SMTP Dispatch]
    UnifiedPayment -.->|Async Non-Blocking| Sheets[Google Sheets Integration]
    
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
│   ├── schema.prisma              # Master PostgreSQL schema definitions (Neon)
│   └── dev.db                     # Historical fallback SQLite DB
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
│   │   │   └── page.tsx           # Regional Bhagalpur attractions guide (Vikramshila, Mandar)
│   │   ├── gallery/
│   │   │   └── page.tsx           # Categorized media gallery
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Admin sidebar with RBAC filtering & responsive navigation
│   │   │   ├── login/page.tsx     # Staff credentials login form
│   │   │   ├── dashboard/page.tsx # Financial KPI metrics, occupancy charts, movements
│   │   │   ├── front-desk/page.tsx# Front Desk walk-in booking & express check-in/out
│   │   │   ├── room-inventory/page.tsx # Physical Room Tape Chart Calendar (Month/Year picker)
│   │   │   ├── inventory/page.tsx # Deprecated legacy grid redirecting to room-inventory
│   │   │   ├── bookings/page.tsx  # Reservations ledger, filters, invoice links
│   │   │   ├── folios/page.tsx    # Dynamic billing folios, itemized charges & split payments
│   │   │   ├── cashier/page.tsx   # Cashier shift opening, closing, cash-in/out reconciliation
│   │   │   ├── housekeeping/page.tsx # Room cleaning statuses (Clean/Dirty/Inspected) & staff tasks
│   │   │   ├── maintenance/page.tsx # Out-of-order logs, repair work orders & ticket statuses
│   │   │   ├── pos/page.tsx       # Restaurant & room service billing direct to room folio
│   │   │   ├── rooms/page.tsx     # Room categories, base tariffs, amenities & photo manager
│   │   │   ├── customers/page.tsx # Guest CRM: visit count, lifetime spends, VIP status
│   │   │   ├── payments/page.tsx  # Cashfree audit ledger & payment resets
│   │   │   ├── promotions/page.tsx# Discount coupon codes & promo campaigns
│   │   │   ├── reports/page.tsx   # Financial KPIs, ADR, RevPAR, CSV exports
│   │   │   ├── audit/page.tsx     # Immutable system-wide audit log trail
│   │   │   ├── staff/page.tsx     # Employee roster, department roles & permissions
│   │   │   ├── cms/page.tsx       # Live content editor: address, contact numbers, policies
│   │   │   ├── reviews/page.tsx   # Guest review moderation: Approve, Feature, Reject
│   │   │   ├── messages/page.tsx  # Guest inquiries inbox & contact submissions
│   │   │   ├── gallery/page.tsx   # Media gallery manager
│   │   │   └── settings/page.tsx  # Hotel policies, GSTIN, check-in/check-out timings
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts  # Issues signed JWT cookie and bearer token
│   │       │   ├── logout/route.ts # Clears session cookie
│   │       │   └── me/route.ts     # Validates current active session
│   │       ├── room-inventory/route.ts # GET Tape Chart matrix, POST/DELETE room blocks
│   │       ├── rooms/
│   │       │   ├── route.ts        # GET all rooms with images & POST new room category
│   │       │   ├── [id]/route.ts   # GET, PUT (rates/amenities), DELETE room
│   │       │   ├── assign/route.ts # POST atomic physical room assignment to booking
│   │       │   └── inventory/route.ts # GET physical room inventory state
│   │       ├── bookings/
│   │       │   ├── route.ts        # GET filtered list & POST create pending reservation
│   │       │   ├── [id]/route.ts   # GET single & PUT update booking status
│   │       │   ├── [id]/extend/route.ts # POST extend reservation stay dates
│   │       │   ├── [id]/modify/route.ts # POST modify room type or guest count
│   │       │   ├── check-availability/route.ts # Real-time date conflict validation
│   │       │   └── walk-in/route.ts # POST front desk walk-in booking with instant room assignment
│   │       ├── folios/
│   │       │   ├── route.ts        # GET all folios & POST create folio line item
│   │       │   └── [id]/route.ts   # GET folio details & PUT settle/close folio
│   │       ├── cashier/
│   │       │   └── shifts/route.ts # GET active shifts, POST open/close/cash-drop shift
│   │       ├── housekeeping/route.ts # GET/PUT room cleaning status & assign housekeeper
│   │       ├── maintenance/route.ts  # GET/POST maintenance work order tickets
│   │       ├── restaurant/route.ts   # GET menu & POST post food order to room folio
│   │       ├── services/route.ts     # GET hotel services catalog
│   │       ├── staff/route.ts        # GET/POST/PUT staff directory & roles
│   │       ├── guests/
│   │       │   └── [id]/documents/route.ts # GET/POST guest ID proof document uploads
│   │       ├── promotions/route.ts   # GET/POST promo codes & discount validation
│   │       ├── refunds/route.ts      # GET/POST process payment refund
│   │       ├── audit/route.ts        # GET system audit logs with filtering
│   │       ├── outbox/route.ts       # GET/POST process pending outbox events
│   │       ├── payments/
│   │       │   ├── route.ts        # GET payment logs for admin audit trail
│   │       │   ├── reset/route.ts  # POST clears test payment logs & resets metrics
│   │       │   └── cashfree/
│   │       │       ├── create-order/route.ts   # Generates Cashfree PG order & session ID
│   │       │       ├── verify-payment/route.ts # Settles payment, updates DB, sends emails
│   │       │       └── webhook/route.ts        # Async Cashfree webhook HMAC verification
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
│   │   ├── BookingModal.tsx        # Guest booking modal with live pricing & Cashfree SDK
│   │   ├── LocationSection.tsx     # Interactive map, directions, railway distance
│   │   ├── AttractionsSection.tsx  # Bhagalpur historical and cultural landmarks
│   │   └── ImageGallery.tsx        # Lightbox image viewer
│   ├── lib/
│   │   ├── prisma.ts               # Singleton PrismaClient with Neon fallback & lambda cache
│   │   ├── auth.ts                 # JWT signing/verification (`jose`), password hashing (`bcrypt`)
│   │   ├── admin-fetch.ts          # Resilient fetch wrapper with Bearer token & no-store headers
│   │   ├── payment-confirm.ts      # Unified payment confirmation pipeline & post-payment notifications
│   │   ├── inventory.ts            # Physical room calendar matrix, date blocking & atomic allocation
│   │   ├── folio.ts                # Dynamic folio ledger, split payments, line items & balance calc
│   │   ├── sequence.ts             # Concurrency-safe atomic reference ID generator (HRJ-YYYYMMDD-XXXX)
│   │   ├── state-machine.ts        # Booking lifecycle transitions, allowed actions & validation
│   │   ├── pricing.ts              # Tiered tariff calculations, extra guests & GST rules
│   │   ├── cashfree.ts             # Cashfree PG API client (orders, verification, webhook HMAC)
│   │   ├── mailer.ts               # Nodemailer SMTP transporter and email dispatcher
│   │   ├── invoice.ts              # HTML confirmation email & printable tax invoice templates
│   │   ├── googlesheets.ts         # Google Sheets API v4 integration via RSA Service Account
│   │   ├── location.ts             # Geographic coordinates & Haversine distance calculator
│   │   └── utils.ts                # Date overlap check, night calculation, helpers
│   ├── proxy.ts                    # Edge Next.js middleware for admin authentication routing
│   └── types/
│       └── json2csv.d.ts           # Type declarations for CSV report export
├── tests/
│   ├── pricing.test.ts             # Suite 1: Tariff calculation, guest tiers, GST rules
│   ├── sequence.test.ts            # Suite 2: 50 concurrent reference generation requests
│   ├── folio.test.ts               # Suite 3: Folio line items, payments, balance settlement
│   ├── state-machine.test.ts       # Suite 4: Reservation state transitions & validation rules
│   ├── security.test.ts            # Suite 5: RBAC permissions, JWT validation, security headers
│   ├── room-inventory.test.ts      # Suite 6: Physical room tape chart, date blocks & unblocking
│   ├── payment-confirm.test.ts     # Suite 7: Unified payment pipeline (6 verification gates)
│   ├── concurrency.test.ts         # Suite 8: 20 simultaneous bookings double-booking stress test
│   └── run-all-tests.ts            # Master test orchestrator executing all 8 suites
├── .env                            # Production secrets (Neon, Cashfree, JWT, SMTP)
├── package.json                    # Dependencies and scripts (build, test, prisma generate)
├── tsconfig.json                   # TypeScript compiler configuration
└── next.config.ts                  # Next.js build parameters
```

---

## 3. Database Architecture & Entity Relationships

The data layer is hosted on Neon Serverless PostgreSQL and managed via Prisma ORM v6.4.0.

### 3.1 Physical Room Inventory Hierarchy

The hotel operates **33 physical rooms** mapped strictly to **3 core room categories**:

| Room Category | RoomType Enum | Total Rooms | Floor Distribution & Room Numbers |
| :--- | :--- | :--- | :--- |
| **AC EXECUTIVE** | `EXECUTIVE` | **18** | Floor 1: `101`, `103`, `104`, `105`<br>Floor 2: `201`, `203`, `204`, `205`, `211`, `212`, `214`, `215`, `216`, `217`<br>Floor 3: `301`, `303`, `304`, `305` |
| **AC DELUXE** | `DELUXE` | **12** | Floor 1: `106`, `107`, `108`, `109`<br>Floor 2: `206`, `207`, `208`, `209`<br>Floor 3: `306`, `307`, `308`, `309` |
| **ROYAL SUITE** | `ROYAL_SUITE` | **3** | Floor 1: `102`<br>Floor 2: `202`<br>Floor 3: `302` |
| **TOTAL** | — | **33** | **100% physically inventory-backed** |

### 3.2 Entity Relationship Diagram

```mermaid
erDiagram
    Room ||--o{ PhysicalRoom : contains
    PhysicalRoom ||--o{ PhysicalRoomAssignment : assigned_to
    PhysicalRoom ||--o{ RoomBlock : blocked_by
    PhysicalRoom ||--o{ HousekeepingTask : serviced_by
    PhysicalRoom ||--o{ MaintenanceTicket : maintained_by

    Customer ||--o{ Booking : books
    Room ||--o{ Booking : categorizes
    Booking ||--o{ PhysicalRoomAssignment : allocates
    Booking ||--o{ Payment : receives
    Booking ||--o{ Folio : bills_through
    Booking ||--o{ OutboxEvent : emits

    Folio ||--o{ FolioItem : records
    User ||--o{ CashierShift : operates
    CashierShift ||--o{ FolioItem : receipts
    User ||--o{ AuditLog : audits

    PhysicalRoom {
        string id PK
        string roomNumber UK
        int floor
        string roomId FK
        enum status
        enum housekeeping
        enum maintenance
        boolean isActive
    }

    Booking {
        string id PK
        string referenceId UK
        string customerId FK
        string roomId FK
        string assignedRoomId FK
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

    Folio {
        string id PK
        string folioNumber UK
        string bookingId FK
        float totalCharges
        float totalPayments
        float balanceAmount
        enum status
    }

    FolioItem {
        string id PK
        string folioId FK
        enum itemType
        string description
        float amount
        float taxAmount
        string paymentMethod
        string referenceId
    }

    RoomBlock {
        string id PK
        string physicalRoomId FK
        datetime startDate
        datetime endDate
        enum blockType
        string reason
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
```

### 3.3 Enumerations Reference

- **`Role`**: `SUPER_ADMIN`, `MANAGER`, `RECEPTION`, `HOUSEKEEPING`, `MAINTENANCE`, `RESTAURANT`, `STAFF`
- **`RoomType`**: `EXECUTIVE`, `DELUXE`, `ROYAL_SUITE`, `DORMITORY`
- **`RoomStatus`**: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `DIRTY`, `CLEANING`, `INSPECTION`, `OUT_OF_ORDER`, `MAINTENANCE`, `DEACTIVATED`, `BLOCKED`
- **`RoomBlockType`**: `MAINTENANCE`, `VIP_HOLD`, `DEEP_CLEANING`, `RENOVATION`, `OUT_OF_SERVICE`, `MANAGEMENT_BLOCK`
- **`RoomBlockStatus`**: `ACTIVE`, `RELEASED`, `CANCELLED`
- **`HousekeepingStatus`**: `CLEAN`, `DIRTY`, `CLEANING`, `INSPECTION`, `READY`, `OUT_OF_ORDER`
- **`MaintenanceStatus`**: `NONE`, `REPORTED`, `UNDER_REPAIR`, `OUT_OF_ORDER`
- **`BookingStatus`**: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`, `NO_SHOW`, `REFUNDED`
- **`AssignmentStatus`**: `ASSIGNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `TRANSFERRED`
- **`PaymentStatus`**: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
- **`PaymentMethod`**: `UPI`, `CARD`, `NETBANKING`, `WALLET`, `CASH`
- **`FolioStatus`**: `OPEN`, `CLOSED`, `SETTLED`, `VOID`
- **`FolioItemType`**: `ROOM_CHARGE`, `RESTAURANT`, `ROOM_SERVICE`, `LAUNDRY`, `MINIBAR`, `EXTRA_BED`, `SERVICE`, `TAX`, `DISCOUNT`, `ADJUSTMENT`, `PAYMENT`, `REFUND`
- **`ShiftStatus`**: `OPEN`, `CLOSED`, `RECONCILED`
- **`CashTxType`**: `CASH_IN`, `CASH_OUT`, `PAYMENT_RECEIVED`, `REFUND_PAID`, `EXPENSE`, `DROP`

---

## 4. Complete Business Logic & Core Engines

### 4.1 Room Tariff & Pricing Calculation Engine
File: [src/lib/pricing.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/pricing.ts)

1. **Duration Calculation**:
   $$\text{Nights} = \max\left(1, \left\lceil \frac{|\text{checkOut} - \text{checkIn}|}{1000 \times 60 \times 60 \times 24} \right\rceil\right)$$

2. **Occupancy Tier Rate**:
   $$\text{Rate Per Night} = \begin{cases} \text{room.basePriceDouble}, & \text{if guests} > 1 \\ \text{room.basePriceSingle}, & \text{if guests} \le 1 \end{cases}$$

3. **Tax & Net Formula**:
   $$\text{Subtotal} = \text{Rate Per Night} \times \text{Nights}$$
   $$\text{Tax Amount (GST)} = \frac{\text{Subtotal} \times \text{room.taxPercentage}}{100}$$
   $$\text{Net Payable Amount} = \text{Subtotal} + \text{Tax Amount} - \text{Discount Amount}$$

---

### 4.2 Concurrency-Safe Sequence Reference Generator
File: [src/lib/sequence.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/sequence.ts)

Generates references in the format `HRJ-YYYYMMDD-XXXX` (e.g. `HRJ-20260929-0416`).
- Uses atomic sequence increments via PostgreSQL transactions (`SELECT ... FOR UPDATE` or upsert counter).
- Guaranteed collision-free under 50+ simultaneous parallel requests (validated in `tests/sequence.test.ts`).

---

### 4.3 Physical Room Inventory Calendar & Tape Chart Engine
File: [src/lib/inventory.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/inventory.ts) & [src/app/admin/room-inventory/page.tsx](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/admin/room-inventory/page.tsx)

1. **Tape Chart Matrix API** (`GET /api/room-inventory?startDate=...&days=14`):
   - Computes daily status for all 33 physical rooms across the date window.
   - Cell statuses: `AVAILABLE`, `CONFIRMED`, `CHECKED_IN`, `BLOCKED`, `MAINTENANCE`, `DIRTY`.
   - Aggregates daily room occupancy % and category-level availability totals.
2. **Date Picker & Month/Year Navigation**:
   - Month Selector: Jumps directly to 1st of any chosen month (Jan–Dec).
   - Year Selector: Spans 2024 through 2032.
   - Direct Datepicker: Fast date selection for future advance reservations.
3. **Date-Based Room Blocking** (`POST /api/room-inventory`):
   - Supports reasons: `MAINTENANCE`, `VIP_HOLD`, `DEEP_CLEANING`, `RENOVATION`, `OUT_OF_SERVICE`.
   - Prevents booking overlapping blocked dates with validation error.
   - Direct Unblock API (`DELETE /api/room-inventory`) releases blocked dates immediately.
4. **Legacy Grid Cleanup**:
   - The redundant `/admin/inventory` route permanently redirects to `/admin/room-inventory`.

---

### 4.4 Concurrency Double-Booking Protection & Atomic Room Allocation
File: [src/lib/inventory.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/inventory.ts) (`allocatePhysicalRoomAtomic`)

1. **Row-Level Locking**:
   - Executes inside an interactive PostgreSQL transaction with `SERIALIZABLE` or `READ COMMITTED` isolation.
   - Queries available physical rooms while querying overlapping `PhysicalRoomAssignment` and `RoomBlock` records:
     $$\text{Overlap}(A_1, A_2, B_1, B_2) = (A_1 < B_2) \land (A_2 > B_1)$$
2. **Atomic Assignment**:
   - Selects the first unassigned physical room for the category.
   - Inserts `PhysicalRoomAssignment` and updates `Booking.assignedRoomId`.
   - Tested under 20 simultaneous concurrent threads competing for finite inventory (validated in `tests/concurrency.test.ts`).

---

### 4.5 Reservation Lifecycle & Finite State Machine (FSM)
File: [src/lib/state-machine.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/state-machine.ts)

```mermaid
stateDiagram-v2
    [*] --> PENDING: Guest initiates reservation
    PENDING --> CANCELLED: Expired after 30 mins
    PENDING --> CONFIRMED: Payment successful & room allocated
    CONFIRMED --> CHECKED_IN: Guest arrives (Reception check-in)
    CHECKED_IN --> CHECKED_OUT: Guest departs (Folio settled)
    CONFIRMED --> CANCELLED: Cancellation requested
    CANCELLED --> REFUNDED: Admin executes refund
    CHECKED_OUT --> [*]
    REFUNDED --> [*]
```

- Invalid transitions (e.g. `PENDING` directly to `CHECKED_OUT`) are rejected with `400 Bad Request`.
- Status changes automatically append an immutable record to `AuditLog`.

---

### 4.6 Cashfree Payment Gateway & Unified Confirmation Pipeline
File: [src/lib/payment-confirm.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/payment-confirm.ts)

Both the Cashfree client return endpoint (`/api/payments/cashfree/verify-payment`) and the webhook listener (`/api/payments/cashfree/webhook`) invoke the centralized `confirmBookingPayment()` pipeline:

```mermaid
sequenceDiagram
    participant Source as Verify API / Webhook
    participant Engine as confirmBookingPayment()
    participant DB as Neon PostgreSQL
    participant Folio as Folio Ledger
    participant Notify as Async Notifier

    Source->>Engine: { bookingId, orderId, paymentId, amount, paymentMethod }
    
    rect rgb(240, 248, 255)
        Note over Engine,DB: Atomic Transaction Pipeline
        Engine->>DB: Check Idempotency Guard (Already CONFIRMED & paid?)
        Engine->>DB: Upsert Payment (status = SUCCESS, gatewayResponse)
        Engine->>DB: Allocate Physical Room if unassigned
        Engine->>Folio: Post Folio PAYMENT Item & Recalculate Balance (status = SETTLED, balance = 0)
        Engine->>DB: Update Booking (status = CONFIRMED, paidAmount = amount)
        Engine->>DB: Insert AuditLog (action = CONFIRM_BOOKING_PAYMENT, user = Cashfree Gateway)
        Engine->>DB: Enqueue OutboxEvent (type = BOOKING_CONFIRMED)
    end
    
    par Non-Blocking Post-Payment Notifications
        Engine->>Notify: Send HTML Confirmation Email (Guest + Hotel Admin)
        Engine->>Notify: Sync Booking Row to Google Sheets (Tab: Bookings)
    end
    
    Engine-->>Source: { success: true, referenceId, assignedRoomNumber, folioNumber }
```

**Key Verification Gates**:
1. **Idempotency Guard**: Repeated webhooks or client returns do not double-bill or duplicate folio entries.
2. **Folio Balance Zeroing**: Full payment settles folio balance to ₹0 and sets status to `SETTLED`.
3. **Double-Booking Shield**: Allocates room atomically via `allocatePhysicalRoomAtomic`.
4. **Audit Trail**: Records gateway response with `userId: null` and `userName: "Cashfree Gateway"`.

---

### 4.7 Dynamic Billing Folio Ledger & Split Payments
File: [src/lib/folio.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/folio.ts) & [src/app/admin/folios/page.tsx](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/admin/folios/page.tsx)

- Every booking maintains a linked `Folio` with sequential reference `FOL-YYYYMMDD-XXXX`.
- **Line Items**: Supports `ROOM_CHARGE`, `TAX`, `RESTAURANT`, `ROOM_SERVICE`, `LAUNDRY`, `EXTRA_BED`, `DISCOUNT`, `PAYMENT`, `REFUND`.
- **Split Payments**: Guests can settle charges across multiple tenders (e.g. ₹2,000 Cash + ₹3,000 UPI).
- **Balance Calculation**:
  $$\text{Total Charges} = \sum (\text{charges}) + \sum (\text{taxes}) - \sum (\text{discounts})$$
  $$\text{Total Payments} = \sum (\text{payments}) - \sum (\text{refunds})$$
  $$\text{Balance Amount} = \text{Total Charges} - \text{Total Payments}$$
- Automatically sets `FolioStatus.SETTLED` when `balanceAmount <= 0`.

---

### 4.8 Front Desk Operations & Walk-in Bookings
File: [src/app/admin/front-desk/page.tsx](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/admin/front-desk/page.tsx) & [src/app/api/bookings/walk-in/route.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/api/bookings/walk-in/route.ts)

- **Express Walk-in Creation**: Front desk receptionists can select guest count, dates, and an available physical room directly.
- **Tender Options**: Instant cash, card, or UPI folio payment posting.
- **Immediate Check-in**: Transitions booking directly to `CHECKED_IN`, assigns physical room, and initializes folio.

---

### 4.9 Housekeeping & Maintenance Workflows
File: [src/app/admin/housekeeping/page.tsx](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/admin/housekeeping/page.tsx) & [src/app/admin/maintenance/page.tsx](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/admin/maintenance/page.tsx)

- **Housekeeping States**: `CLEAN`, `DIRTY`, `CLEANING`, `INSPECTION`, `READY`, `OUT_OF_ORDER`.
- **Auto-Dirtying**: Checking out a guest automatically flips the physical room housekeeping status to `DIRTY`.
- **Task Dispatching**: Managers assign rooms to housekeeping staff with priorities (`LOW`, `NORMAL`, `HIGH`, `URGENT`).
- **Maintenance Tickets**: Rooms under repair trigger automatic calendar room blocks with reason `MAINTENANCE`.

---

### 4.10 Transactional Email & Tax Invoice Engine
File: [src/lib/mailer.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/mailer.ts) & [src/lib/invoice.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/invoice.ts)

- **Dual Email Notification**:
  - Recipient 1: Guest email.
  - Recipient 2: Official Hotel Reception: `info@hotelrajhansinternational.com`
  - Recipient 3: Hotel Management: `rajhansinternational.info@gmail.com`
- **Email Contents**:
  - Verification badge, Booking reference ID, Assigned Physical Room Number.
  - Check-in (12:00 PM) / Check-out (11:00 AM) schedule.
  - Itemized Tariff & GST breakdown.
  - Hotel GSTIN (`10AAAAA0000A1Z5`).
  - 1-click Google Maps Navigation button.
- **Tax Invoice (`/api/invoice/[id]`)**:
  - Renders printable tax invoice complying with Indian GST rules.

---

### 4.11 Google Sheets Bi-Directional Synchronization
File: [src/lib/googlesheets.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/googlesheets.ts)

- **Authentication**: Generates self-signed RS256 JWT using Google Cloud Service Account credentials and requests OAuth2 access token.
- **Deduplication**: Reads Column A (`Bookings!A:A`) to verify reference ID does not already exist before appending.
- **Row Columns (A:L)**:
  `[Reference, Date, Guest Name, Phone, Email, Room Type, Check-in, Check-out, Guests, Amount, Payment Status, Booking Status]`

---

### 4.12 Location & Distance Engine
File: [src/lib/location.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/location.ts)

- **Hotel Coordinates**: `25.2505° N, 86.9887° E` (Kachari Chowk, MG Road)
- **Railway Station Coordinates**: `25.2435° N, 86.9743° E` (Bhagalpur Junction BGP)
- **Haversine Distance Formula**:
  $$a = \sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1) \cos(\text{lat}_2) \sin^2\left(\frac{\Delta \text{lng}}{2}\right)$$
  $$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$
  $$\text{Road Distance} \approx R \times c \times 1.3 \quad (\text{where } R = 6371\text{ km})$$
  Result: ~2.5 km (10-15 minute drive).

---

### 4.13 Security, RBAC & Outbox Pattern Event Dispatching
File: [src/lib/auth.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/lib/auth.ts), [src/proxy.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/proxy.ts), & [src/app/api/outbox/route.ts](file:///Users/mrinal/Documents/hotelrajhansinternational/src/app/api/outbox/route.ts)

- **JWT Signing**: Uses `jose` with `HS256`, 7-day expiration, and 30s clock tolerance.
- **Dual Transport**: HTTP-only secure cookie `rajhans_admin_token` + `Authorization: Bearer <token>` header.
- **Edge Middleware Guard** (`src/proxy.ts`): Protects `/admin/*` routes against unauthorized access.
- **Transactional Outbox**: Critical domain events (`BOOKING_CREATED`, `BOOKING_CONFIRMED`, `PAYMENT_RECEIVED`) write to the `OutboxEvent` table inside the DB transaction, ensuring reliable asynchronous message delivery.

---

## 5. Complete API Endpoints Catalog

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/room-inventory` | `GET` | Staff / Admin | Returns 33-room tape chart matrix, occupancy % and daily statuses |
| `/api/room-inventory` | `POST` | Manager+ | Creates a date-based room block (maintenance, VIP hold, cleaning) |
| `/api/room-inventory` | `DELETE` | Manager+ | Releases an active room block |
| `/api/rooms/assign` | `POST` | Reception+ | Atomically assigns a physical room to a reservation |
| `/api/rooms/inventory` | `GET` | Staff / Admin | Retrieves real-time room availability across date ranges |
| `/api/rooms` | `GET` | Public | Returns room categories with base tariffs, amenities, photos |
| `/api/rooms` | `POST` | Admin | Creates a new room category |
| `/api/rooms/[id]` | `GET` | Public | Returns single room category details |
| `/api/rooms/[id]` | `PUT` | Admin | Updates base prices, extra bed charges, taxes, amenities |
| `/api/rooms/[id]` | `DELETE` | Super Admin | Removes a room category |
| `/api/bookings` | `GET` | Staff / Admin | Lists bookings filtered by status, dates, or search query |
| `/api/bookings` | `POST` | Public | Creates pending guest reservation session |
| `/api/bookings/[id]` | `GET` | Staff / Admin | Retrieves reservation details with folio and room assignment |
| `/api/bookings/[id]` | `PUT` | Reception+ | Updates booking status (`CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`) |
| `/api/bookings/[id]/extend` | `POST` | Reception+ | Extends stay dates if physical room has no conflicts |
| `/api/bookings/[id]/modify` | `POST` | Reception+ | Modifies guest count or room category |
| `/api/bookings/walk-in` | `POST` | Reception+ | Creates instant front desk walk-in booking with room assignment |
| `/api/bookings/check-availability` | `GET` | Public | Checks real-time date availability for room categories |
| `/api/folios` | `GET` | Staff / Admin | Lists all active and settled folios |
| `/api/folios` | `POST` | Reception+ | Posts new line item charge or payment to guest folio |
| `/api/folios/[id]` | `GET` | Staff / Admin | Returns itemized folio ledger with balance breakdown |
| `/api/folios/[id]` | `PUT` | Reception+ | Settles or closes folio |
| `/api/cashier/shifts` | `GET` | Staff / Admin | Lists active and historical cashier shifts |
| `/api/cashier/shifts` | `POST` | Reception+ | Opens/closes cashier shift or records cash drop |
| `/api/housekeeping` | `GET` | Housekeeping+ | Returns room cleaning statuses and assigned cleaning tasks |
| `/api/housekeeping` | `PUT` | Housekeeping+ | Updates room cleaning state (`CLEAN`, `DIRTY`, `INSPECTED`) |
| `/api/maintenance` | `GET` | Maintenance+ | Lists open maintenance tickets and out-of-order rooms |
| `/api/maintenance` | `POST` | Maintenance+ | Submits maintenance repair work order |
| `/api/restaurant` | `GET` | Restaurant+ | Returns F&B menu catalog |
| `/api/restaurant` | `POST` | Restaurant+ | Posts restaurant or room service charge to room folio |
| `/api/promotions` | `GET` | Public / Admin | Validates coupon code or lists active promotions |
| `/api/promotions` | `POST` | Manager+ | Creates new promotional discount code |
| `/api/refunds` | `POST` | Super Admin | Executes payment refund through Cashfree API |
| `/api/audit` | `GET` | Manager+ | Queries immutable audit log entries |
| `/api/outbox` | `GET` | Super Admin | Inspects pending and processed outbox events |
| `/api/staff` | `GET` | Manager+ | Lists staff roster and departmental roles |
| `/api/staff` | `POST` | Super Admin | Registers new staff member or updates permissions |
| `/api/guests/[id]/documents` | `POST` | Reception+ | Uploads and associates guest ID proof documents |
| `/api/payments` | `GET` | Admin | Lists Cashfree payment transactions |
| `/api/payments/reset` | `POST` | Super Admin | Resets test payment records |
| `/api/payments/cashfree/create-order` | `POST` | Public | Creates Cashfree PG order & returns session ID |
| `/api/payments/cashfree/verify-payment` | `POST` | Public | Verifies payment return and executes unified confirmation |
| `/api/payments/cashfree/webhook` | `POST` | Cashfree | Asynchronous webhook verification handler |
| `/api/cms` | `GET` | Public | Fetches global site settings and FAQs |
| `/api/cms` | `PUT` | Super Admin | Updates global CMS settings |
| `/api/contact` | `POST` | Public | Submits guest inquiry and syncs to Google Sheets |
| `/api/customers` | `GET` | Admin | Searches customer CRM database |
| `/api/reviews` | `GET` | Public | Retrieves approved guest reviews |
| `/api/reviews` | `POST` | Public | Submits a guest review for moderation |
| `/api/reports` | `GET` | Admin | Returns financial KPIs, ADR, RevPAR, and occupancy |
| `/api/invoice/[id]` | `GET` | Public / Admin | Renders printable GST tax invoice |
| `/api/location/distance` | `GET` | Public | Returns distance calculation from Bhagalpur Junction |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and sets session cookie |
| `/api/auth/logout` | `POST` | Admin | Clears session cookie |
| `/api/auth/me` | `GET` | Admin | Returns logged-in user profile |

---

## 6. Frontend Architecture & Page Routes

### Public Guest Pages
- **`/` (Homepage)**: Luxury gold/cream theme, hero carousel, live room rates, booking modal with Cashfree SDK, Takshshila restaurant showcase, amenities, reviews, FAQs, and interactive location map.
- **`/gallery`**: Filterable photo gallery (Reception, Executive, Deluxe, Royal Suite, Restaurant, Parlour).
- **`/attraction`**: Bhagalpur regional tourist destinations with distances and driving times.

### Admin Dashboard Pages (`/admin/*`)
- **`/admin/dashboard`**: KPI cards (Revenue, Confirmed Bookings, Available Rooms, Occupancy %), revenue area chart, today's arrivals/departures, and quick actions.
- **`/admin/front-desk`**: Front Desk express check-in/out, walk-in reservations, and live room assignment.
- **`/admin/room-inventory`**: Master Physical Room Tape Chart Calendar with Month/Year picker, date selector, occupancy stats, and date blocking.
- **`/admin/inventory`**: Direct client redirect to `/admin/room-inventory`.
- **`/admin/bookings`**: Reservation ledger with status filter tabs, search bar, and PDF invoice links.
- **`/admin/folios`**: Dynamic billing folio ledger, itemized charges, and split payment settlement.
- **`/admin/cashier`**: Cashier shift management, opening float, cash drops, and end-of-shift reconciliation.
- **`/admin/housekeeping`**: Housekeeping board with room cleaning statuses (`CLEAN`, `DIRTY`, `INSPECTED`) and staff task assignments.
- **`/admin/maintenance`**: Out-of-order room tracker and repair work order management.
- **`/admin/pos`**: Point of Sale restaurant billing directly linked to guest room folios.
- **`/admin/rooms`**: Visual tariff editor for single/double prices, taxes, and amenities.
- **`/admin/customers`**: CRM database with guest visit history, total spends, and VIP tags.
- **`/admin/payments`**: Cashfree transaction audit trail with Order IDs, Payment IDs, and settlement logs.
- **`/admin/promotions`**: Coupon code management and discount campaigns.
- **`/admin/reports`**: Revenue reporting, ADR, RevPAR, occupancy rate, and CSV exports.
- **`/admin/audit`**: Immutable system audit trail tracking all administrative actions.
- **`/admin/staff`**: Staff directory, role-based access control, and shift assignments.
- **`/admin/cms`**: Live site editor for contact numbers, addresses, and check-in/out policies.
- **`/admin/reviews`**: Guest review moderation board (Approve, Feature, Reject).
- **`/admin/messages`**: Contact inbox displaying inquiries with reply tools.
- **`/admin/gallery`**: Media gallery organizer and photo uploader.
- **`/admin/settings`**: Hotel policies, GSTIN, check-in/check-out timings, and system configurations.

---

## 7. Automated Testing Suite (8 Suites)

The application enforces automated end-to-end regression protection across 8 comprehensive test suites executed via `npm test`:

```bash
npm test
```

| Suite | File | Coverage & Validation Focus |
| :--- | :--- | :--- |
| **1. Pricing Engine** | `tests/pricing.test.ts` | Base single/double rates, extra guests, tiered GST brackets (12%/18%) |
| **2. Sequence Generator** | `tests/sequence.test.ts` | 50 concurrent reference generation calls (100% collision-free) |
| **3. Dynamic Folio** | `tests/folio.test.ts` | Folio line items, tax additions, split payments, balance settlement |
| **4. State Machine (FSM)** | `tests/state-machine.test.ts` | Booking lifecycle transitions, allowed actions & validation rules |
| **5. Security & RBAC** | `tests/security.test.ts` | JWT tokens, role-based route access, HMAC verification, security headers |
| **6. Room Inventory** | `tests/room-inventory.test.ts` | 33-room tape chart matrix, date-based room blocks, unblocking |
| **7. Payment Pipeline** | `tests/payment-confirm.test.ts` | All 6 gates: Booking, Payment, Folio balance, AuditLog, Outbox, Idempotency |
| **8. Concurrency Stress** | `tests/concurrency.test.ts` | 20 simultaneous bookings double-booking stress test with atomic locking |

---

## 8. Environment Variables Matrix

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

## 9. Production Deployment & Operational Best Practices

1. **Prisma Client Generation**:
   - The build script in `package.json` executes `prisma generate && next build`.
   - In serverless environments, Prisma instance pooling is maintained on `globalThis` to prevent connection exhaustion.
2. **Serverless Cache Invalidation**:
   - Dynamic API route handlers declare:
     ```typescript
     export const dynamic = "force-dynamic";
     export const revalidate = 0;
     ```
   - All fetch operations across the admin panel utilize `adminFetch` with `cache: "no-store"` and `Cache-Control: no-cache` headers.
3. **Database Migration Policy**:
   - When modifying schema models, run `npx prisma db push` to synchronize Neon PostgreSQL without resetting live production data.
4. **Resilient Transaction Timeouts**:
   - For high-concurrency database transactions under cloud latency, configure Prisma interactive transactions with:
     ```typescript
     prisma.$transaction(async (tx) => { ... }, { maxWait: 10000, timeout: 45000 })
     ```
