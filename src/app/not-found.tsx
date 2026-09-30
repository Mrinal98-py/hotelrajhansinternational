import type { Metadata } from "next";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata("Page Not Found");

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <span className="text-xs uppercase tracking-widest font-mono text-gold-600 font-bold mb-2">404 Error</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brown-950 mb-3">Page Not Found</h1>
        <p className="text-sm text-brown-700 max-w-md mb-8">
          The page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-brown-900 hover:bg-brown-800 text-cream font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
        >
          Return to Homepage
        </Link>
      </div>
    </PublicLayout>
  );
}
