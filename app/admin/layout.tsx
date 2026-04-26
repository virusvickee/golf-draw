"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Trophy, Heart, Award, BarChart3, LogOut, Menu, X, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Draws", href: "/admin/draws", icon: Trophy },
  { label: "Charities", href: "/admin/charities", icon: Heart },
  { label: "Winners", href: "/admin/winners", icon: Award },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/login");
    } catch (err: any) {
      console.error("Logout failed", err);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 text-slate-300">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-emerald-500" />
          <span className="text-xl font-black tracking-tight text-white">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                isActive
                  ? "bg-emerald-500 text-white"
                  : "hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleLogout}>
          <LogOut className="w-5 h-5 mr-3" />
          Exit Admin
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-500" />
          <span className="text-lg font-bold text-white">Admin</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-2 text-slate-300"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        id="mobile-menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 transition-transform duration-200 ease-in-out md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
