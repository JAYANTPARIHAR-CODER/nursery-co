import type { Metadata } from "next";
import { platformStats } from "@/lib/catalog";
import { DashShell, type NavItem } from "@/components/dash/Shell";

export const metadata: Metadata = {
  title: "Admin console",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const stats = platformStats();

  const nav: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "overview" },
    {
      href: "/admin/catalogue",
      label: "Plant catalogue",
      icon: "catalogue",
      badge: stats.draftPlants,
    },
    {
      href: "/admin/nurseries",
      label: "Nurseries",
      icon: "nurseries",
      badge: stats.pendingVerification,
    },
    { href: "/admin/billing", label: "Billing", icon: "billing", badge: stats.pastDue },
  ];

  return (
    <DashShell nav={nav} title="Admin console" subtitle="Platform operator" accent="admin">
      {children}
    </DashShell>
  );
}
