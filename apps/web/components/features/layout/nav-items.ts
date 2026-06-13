import {
  CreditCard,
  LayoutDashboard,
  Receipt,
  Users,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/settlements", label: "Settlements", icon: CreditCard },
] as const;
