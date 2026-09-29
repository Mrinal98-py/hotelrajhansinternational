import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-brown-900 selection:bg-gold-300 selection:text-brown-950 font-sans">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
