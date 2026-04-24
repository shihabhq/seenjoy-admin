"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  LogOut,
  GraduationCap,
  Tag,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/registrations",
    label: "Registrations",
    icon: Users,
  },
  {
    href: "/dashboard/coupons",
    label: "Coupons",
    icon: Tag,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-[#0D0D14] border-r border-[#1E1E2A]">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#1E1E2A]">
        <div className="w-8 h-8 rounded-lg bg-[#20b2aa]/15 flex items-center justify-center">
          <GraduationCap className="w-4.5 h-4.5 text-[#20b2aa]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#F0F0F5] leading-none">
            Seenjoy
          </p>
          <p className="text-[10px] text-[#6B7280] mt-0.5 leading-none">
            Admin Dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-[#20b2aa]/12 text-[#20b2aa]"
                  : "text-[#9CA3AF] hover:text-[#F0F0F5] hover:bg-[#1A1A24]"
              )}
            >
              <item.icon
                className={cn(
                  "w-4.5 h-4.5 transition-colors",
                  isActive
                    ? "text-[#20b2aa]"
                    : "text-[#6B7280] group-hover:text-[#9CA3AF]"
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-[#20b2aa]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-[#1E1E2A]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
