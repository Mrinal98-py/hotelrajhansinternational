import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { generateBreadcrumbSchema } from "@/lib/seo";

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const fullItems = [{ name: "Home", url: "/" }, ...items];

  // Prepare schema data only for items that have a URL
  const schemaItems = fullItems
    .filter((item): item is { name: string; url: string } => Boolean(item.url))
    .map((item) => ({ name: item.name, url: item.url }));

  const schema = generateBreadcrumbSchema(schemaItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="w-full py-3 text-xs text-brown-700">
        <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
          <li className="flex items-center gap-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-brown-950 font-medium transition-colors"
            >
              <Home className="h-3.5 w-3.5 text-brown-600" />
              <span>Home</span>
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3 text-brown-400 shrink-0" />
                {item.url && !isLast ? (
                  <Link
                    href={item.url}
                    className="hover:text-brown-950 font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-brown-900" aria-current="page">
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
