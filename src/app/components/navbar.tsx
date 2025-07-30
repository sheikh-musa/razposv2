"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home01, Box, FileX01, BarChart01, Settings01 } from "@untitledui/icons";
import { SidebarNavigationSimple } from "@/components/application/app-navigation/sidebar-navigation/sidebar-simple";
import type { NavItemType } from "@/components/application/app-navigation/config";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use empty string during SSR to prevent hydration mismatch
  const activeUrl = mounted ? pathname : "";

  // Main navigation items
  const navItems: NavItemType[] = [
    {
      label: "Home",
      href: "/",
      icon: Home01,
    },
    {
      label: "Kitchen",
      href: "/kitchen",
      icon: Box,
    },
    {
      label: "Inventory",
      href: "/inventory",
      icon: Box,
    },
    {
      label: "Orders",
      href: "/orders",
      icon: FileX01,
    },
    {
      label: "Reporting",
      icon: BarChart01,
      items: [
        {
          label: "Analytics",
          href: "/reporting/analytics",
          icon: BarChart01,
        },
        {
          label: "Transaction History",
          href: "/reporting/transactionHistory",
          icon: FileX01,
        },
      ],
    },
  ];

  // Footer navigation items
  const footerItems: NavItemType[] = [
    {
      label: "Settings",
      href: "/settings",
      icon: Settings01,
    },
  ];

  return <SidebarNavigationSimple activeUrl={activeUrl} items={navItems} footerItems={footerItems} showAccountCard={false} />;
}
