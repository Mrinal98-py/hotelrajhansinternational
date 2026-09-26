"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Image as ImageIcon,
  Users,
  CreditCard,
  BarChart3,
  Globe,
  Star,
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

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Rooms & Pricing", href: "/admin/rooms", icon: BedDouble },
    { label: "Guests CRM", href: "/admin/customers", icon: Users },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Analytics & Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "CMS & Settings", href: "/admin/cms", icon: Globe },
    { label: "Inquiries", href: "/admin/messages", icon: MessageSquare },
    { label: "System Config", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 flex flex-col justify-between ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-900 border border-slate-200">
                <Hotel className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold uppercase tracking-wider leading-tight text-slate-900">
                  Rajhans
                </h2>
                <p className="text-[9px] uppercase tracking-widest font-mono text-slate-800 font-bold">
                  Hotel HMS Admin
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

          <nav className="p-4 space-y-1.5 max-h-[calc(100vh-180px)] overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-800 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-xs uppercase">
                {user.name ? user.name[0] : "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-slate-900">{user.name}</p>
                <span className="inline-block text-[9px] uppercase tracking-wider font-mono text-slate-800 font-bold">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
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

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs uppercase font-extrabold tracking-widest border border-slate-300 text-slate-900 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors hover:bg-slate-100"
            >
              <Globe className="h-3.5 w-3.5 text-slate-900" /> View Public Site
            </a>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
