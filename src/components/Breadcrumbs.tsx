import Link from "next/link";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/seo";

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: "dark" | "light";
  showBackLink?: boolean;
  backLink?: {
    href: string;
    label: string;
  };
  currentUrl?: string;
}

export default function Breadcrumbs({
  items,
  variant = "dark",
  showBackLink = true,
  backLink,
  currentUrl,
}: BreadcrumbsProps) {
  const fullItems: BreadcrumbItem[] = [{ name: "Home", url: "/" }, ...items];

  // Resolve back-link target (explicit or parent item)
  let resolvedBackLink: { href: string; label: string } | null = null;
  if (showBackLink) {
    if (backLink) {
      resolvedBackLink = backLink;
    } else if (items.length > 1) {
      const parent = items[items.length - 2];
      resolvedBackLink = {
        href: parent.url || "/",
        label: parent.name,
      };
    } else {
      resolvedBackLink = {
        href: "/",
        label: "Home",
      };
    }
  }

  const schema = generateBreadcrumbSchema(fullItems, currentUrl);
  const isDark = variant === "dark";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-2 text-xs">
        {resolvedBackLink && (
          <>
            <Link
              href={resolvedBackLink.href}
              className={
                isDark
                  ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 hover:text-gold-100 border border-gold-400/25 text-xs font-semibold tracking-wide transition-all shadow-xs shrink-0 group"
                  : "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brown-900/5 hover:bg-brown-900/10 text-brown-800 hover:text-brown-950 border border-brown-900/15 text-xs font-semibold tracking-wide transition-all shadow-xs shrink-0 group"
              }
              title={`Return to ${resolvedBackLink.label}`}
            >
              <ArrowLeft
                className={`h-3 w-3 transition-transform group-hover:-translate-x-0.5 ${
                  isDark ? "text-gold-400" : "text-brown-600"
                }`}
              />
              <span>Back to {resolvedBackLink.label}</span>
            </Link>
            <div
              className={`h-4 w-px hidden sm:block shrink-0 ${
                isDark ? "bg-gold-400/25" : "bg-brown-900/15"
              }`}
            />
          </>
        )}

        <nav aria-label="Breadcrumb">
          <ol
            className={`flex items-center flex-wrap gap-1.5 list-none p-0 m-0 ${
              isDark ? "text-gold-200/90" : "text-brown-700"
            }`}
          >
            <li className="flex items-center gap-1.5">
              <Link
                href="/"
                className={
                  isDark
                    ? "inline-flex items-center gap-1 hover:text-gold-100 font-medium transition-colors"
                    : "inline-flex items-center gap-1 hover:text-brown-950 font-medium transition-colors"
                }
              >
                <Home
                  className={`h-3.5 w-3.5 ${
                    isDark ? "text-gold-400/80" : "text-brown-600"
                  }`}
                />
                <span>Home</span>
              </Link>
            </li>

            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={index} className="flex items-center gap-1.5">
                  <ChevronRight
                    className={`h-3 w-3 shrink-0 ${
                      isDark ? "text-gold-400/60" : "text-brown-400"
                    }`}
                  />
                  {item.url && !isLast ? (
                    <Link
                      href={item.url}
                      className={
                        isDark
                          ? "hover:text-gold-100 font-medium transition-colors"
                          : "hover:text-brown-950 font-medium transition-colors"
                      }
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span
                      className={`font-semibold ${
                        isDark ? "text-cream" : "text-brown-950"
                      }`}
                      aria-current="page"
                    >
                      {item.name}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </>
  );
}
