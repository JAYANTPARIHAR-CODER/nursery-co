import type { Metadata } from "next";
import { nurseryStats } from "@/lib/catalog";
import { currentNursery, CURRENT_NURSERY_ID } from "@/lib/session";
import { DashShell, type NavItem } from "@/components/dash/Shell";

export const metadata: Metadata = {
  title: "Nursery dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const nursery = currentNursery();
  const stats = nurseryStats(CURRENT_NURSERY_ID);

  const nav: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "overview" },
    {
      href: "/dashboard/inventory",
      label: "My stock",
      icon: "stock",
      badge: stats.outOfStock,
    },
    {
      href: "/dashboard/enquiries",
      label: "Enquiries",
      icon: "enquiries",
      badge: stats.newEnquiries,
    },
    { href: "/dashboard/plan", label: "Plan & billing", icon: "billing" },
  ];

  return (
    <DashShell nav={nav} title={nursery.name} subtitle="Nursery partner" accent="nursery">
      {children}
    </DashShell>
  );
}
