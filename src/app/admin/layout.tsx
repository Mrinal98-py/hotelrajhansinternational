"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ConciergeBell,
  CalendarCheck,
  Grid3X3,
  BedDouble,
  Sparkles,
  Wrench,
  Receipt,
  Wallet,
  UtensilsCrossed,
  Users,
  CreditCard,
  Tag,
  BarChart3,
  UserCheck,
  ShieldAlert,
  Globe,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Hotel,
} from "lucide-react";

import { adminFetch } from "@/lib/admin-fetch";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    adminFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push("/admin/login");
        }
      })
      .catch(() => router.push("/admin/login"));
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("rajhans_admin_token");
    } catch {}
    await adminFetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const navSections = [
    {
      title: "Front Desk & Stays",
      items: [
        { label: "Front Desk Operations", href: "/admin/front-desk", icon: ConciergeBell },
        { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
        { label: "Room Inventory Grid", href: "/admin/inventory", icon: Grid3X3 },
        { label: "Room Types & Rates", href: "/admin/rooms", icon: BedDouble },
      ],
    },
    {
      title: "Operations & Facilities",
      items: [
        { label: "Housekeeping", href: "/admin/housekeeping", icon: Sparkles },
        { label: "Maintenance Tickets", href: "/admin/maintenance", icon: Wrench },
        { label: "Restaurant & POS", href: "/admin/pos", icon: UtensilsCrossed },
      ],
    },
    {
      title: "Financials & Billing",
      items: [
        { label: "Guest Folios", href: "/admin/folios", icon: Receipt },
        { label: "Cashier Shifts", href: "/admin/cashier", icon: Wallet },
        { label: "Payments Audit", href: "/admin/payments", icon: CreditCard },
      ],
    },
    {
      title: "Management & CRM",
      items: [
        { label: "Executive Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Guests CRM & KYC", href: "/admin/customers", icon: Users },
        { label: "Promotions & Rates", href: "/admin/promotions", icon: Tag },
        { label: "Analytics & KPIs", href: "/admin/reports", icon: BarChart3 },
        { label: "Staff & Attendance", href: "/admin/staff", icon: UserCheck },
        { label: "Security & Audit Logs", href: "/admin/audit", icon: ShieldAlert },
      ],
    },
    {
      title: "System & Public CMS",
      items: [
        { label: "CMS & Web Content", href: "/admin/cms", icon: Globe },
        { label: "Guest Inquiries", href: "/admin/messages", icon: MessageSquare },
        { label: "System Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 flex flex-col justify-between ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
            <Link href="/admin/front-desk" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
                <Hotel className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold uppercase tracking-wider leading-tight text-slate-900">
                  Rajhans
                </h2>
                <p className="text-[9px] uppercase tracking-widest font-mono text-amber-700 font-bold">
                  HMS Enterprise
                </p>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-700 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-3 space-y-4 overflow-y-auto flex-1 text-xs">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-700 font-mono">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-700"}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 space-y-3 shrink-0 bg-slate-50/50">
            {user && (
              <div className="flex items-center gap-2.5 px-1">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user.name ? user.name[0] : "A"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate text-slate-900">{user.name}</p>
                  <span className="inline-block text-[9px] uppercase tracking-wider font-mono text-amber-700 font-bold">
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout Session
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-900 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-serif text-lg font-bold tracking-wide capitalize text-slate-900">
              {pathname.replace("/admin/", "").replace(/-/g, " ") || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/front-desk"
              className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ConciergeBell className="h-3.5 w-3.5" /> Front Desk
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors hover:bg-slate-100"
            >
              <Globe className="h-3.5 w-3.5 text-slate-500" /> View Website
            </a>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 flex-1 bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
