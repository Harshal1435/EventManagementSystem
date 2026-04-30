import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, CreditCard, ShoppingCart,
  Package, ClipboardList, LogOut, Menu, X, ChevronRight,
  Zap, Bell, CalendarDays, Ticket, UserCheck, ShoppingBag,
} from "lucide-react";

const roleMenus = {
  // ── ADMIN: Maintenance Menu (Admin access only) ───────
  admin: [
    { label: "Dashboard",            icon: LayoutDashboard, path: "/admin" },
    { label: "Maintain User",        icon: Users,           path: "/admin/users" },
    { label: "Maintain Vendor",      icon: Store,           path: "/admin/vendors" },
    { label: "Add Membership",       icon: CreditCard,      path: "/admin/membership" },
    { label: "Update Membership",    icon: CreditCard,      path: "/admin/vendor-membership" },
    { label: "All Events",           icon: CalendarDays,    path: "/admin/events" },
    { label: "All Bookings",         icon: Ticket,          path: "/admin/bookings" },
    { label: "All Orders",           icon: ShoppingBag,     path: "/admin/orders" },
  ],

  // ── VENDOR: Main Page ─────────────────────────────────
  vendor: [
    { label: "Dashboard",       icon: LayoutDashboard, path: "/vendor" },
    { label: "Your Item",       icon: Package,         path: "/vendor/insert" },
    { label: "Add New Item",    icon: Zap,             path: "/vendor/add-item" },
    { label: "Product Status",  icon: Store,           path: "/vendor/product-status" },
    { label: "Request Item",    icon: ClipboardList,   path: "/vendor/request-item" },
    { label: "View Product",    icon: Store,           path: "/vendor/view-product" },
    { label: "Transaction",     icon: CreditCard,      path: "/vendor/transaction" },
    { label: "User Request",    icon: ShoppingBag,     path: "/vendor/orders" },
    { label: "My Events",       icon: CalendarDays,    path: "/vendor/events" },
  ],

  // ── USER: User Portal ─────────────────────────────────
  user: [
    { label: "Dashboard",    icon: LayoutDashboard, path: "/user" },
    { label: "Vendor",       icon: Store,           path: "/user/products" },
    { label: "Cart",         icon: ShoppingCart,    path: "/user/cart" },
    { label: "Guest List",   icon: UserCheck,       path: "/user/guest-list" },
    { label: "Order Status", icon: ClipboardList,   path: "/user/orders" },
    { label: "Browse Events",icon: CalendarDays,    path: "/user/events" },
    { label: "My Bookings",  icon: Ticket,          path: "/user/bookings" },
  ],
};

const roleColors = {
  admin:  { from: "#6366f1", to: "#8b5cf6", label: "Admin" },
  vendor: { from: "#0ea5e9", to: "#6366f1", label: "Vendor" },
  user:   { from: "#10b981", to: "#0ea5e9", label: "User" },
};

export default function DashboardLayout({ children, role = "user", userName = "User" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = roleMenus[role] || [];
  const colors = roleColors[role] || roleColors.user;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
            style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
            EMS
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">EventMS</p>
            <p className="text-slate-400 text-xs mt-0.5">{colors.label} Panel</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
            {userName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{userName}</p>
            <p className="text-slate-400 text-xs capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menu.map(({ label, icon: Icon, path }) => (
          <button key={path} onClick={() => { navigate(path); setSidebarOpen(false); }}
            className={`sidebar-link w-full text-left ${isActive(path) ? "active" : ""}`}>
            <Icon size={17} />
            <span>{label}</span>
            {isActive(path) && <ChevronRight size={13} className="ml-auto" />}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="sidebar-link w-full text-left hover:!bg-red-500/20 hover:!text-red-400">
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const currentLabel = menu.find(m => isActive(m.path))?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-slate-900 fixed top-0 left-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-slate-900 h-full z-50 flex flex-col">
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800">
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-slate-800 font-bold text-base leading-none">{currentLabel}</h1>
              <p className="text-slate-400 text-xs mt-0.5">Event Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition">
              <Bell size={16} />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
