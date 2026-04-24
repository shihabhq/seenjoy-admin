"use client";

import { useState } from "react";
import { Menu, GraduationCap } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#0A0A0F]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar — hamburger + brand */}
        <div className="lg:hidden h-14 flex items-center gap-3 px-4 bg-[#0D0D14] border-b border-[#1E1E2A] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#F0F0F5] hover:bg-[#1A1A24] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 rounded-md bg-[#20b2aa]/15 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-[#20b2aa]" />
          </div>
          <span className="text-sm font-semibold text-[#F0F0F5]">
            Seenjoy Admin
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
