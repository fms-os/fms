import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LayoutDashboard, Briefcase, Users, UserCircle, Calendar, Sparkles, Inbox, Plug, Settings, LogOut, Menu, Bell, Search, FileEdit, Newspaper } from "lucide-react";

const NAV = [
  { to: "/os", end: true, label: "Command Center", icon: LayoutDashboard },
  { to: "/os/projects", label: "Projets", icon: Briefcase },
  { to: "/os/artists", label: "Artistes", icon: Sparkles },
  { to: "/os/clients", label: "Clients", icon: Users },
  { to: "/os/bookings", label: "Studio & Booking", icon: Calendar },
  { to: "/os/ar", label: "A&R Pipeline", icon: UserCircle },
  { to: "/os/leads", label: "Leads", icon: Inbox },
  { to: "/os/cms", label: "CMS Site", icon: FileEdit },
  { to: "/os/news", label: "Actus", icon: Newspaper },
  { to: "/os/integrations", label: "Intégrations", icon: Plug },
  { to: "/os/settings", label: "Paramètres", icon: Settings },
];

export default function OSLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="os-shell flex">
      <aside data-testid="os-sidebar" className={`os-sidebar ${collapsed ? "w-16" : "w-64"} min-h-screen flex flex-col transition-[width] duration-200`}>
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          {!collapsed && (
            <div>
              <div className="text-white public-serif text-xl leading-none">FMS OS</div>
              <div className="os-data-label text-white/40 mt-1 text-[10px]">Factory Maker Studio</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} data-testid="sidebar-toggle" className="text-white/60 hover:text-white transition-colors"><Menu size={18} /></button>
        </div>
        {!collapsed && user && (
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#A78BFA] text-black flex items-center justify-center text-sm font-semibold">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0">
              <div className="text-white text-sm truncate">{user.name || "—"}</div>
              <div className="os-data-label text-white/40 text-[10px] uppercase">{user.role}</div>
            </div>
          </div>
        )}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map((n) => {
            const I = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                data-testid={`os-nav-${n.label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                className={({ isActive }) => `os-sidebar-item ${isActive ? "" : ""} flex items-center gap-3 px-5 py-2.5 text-sm`}
                data-active={undefined}
              >
                {({ isActive }) => (
                  <span data-active={isActive ? "true" : "false"} className={`w-full flex items-center gap-3 -mx-5 px-5 py-2.5 ${isActive ? "bg-[#2E1065] text-[#C4B5FD] border-l-2 border-[#A78BFA]" : "hover:bg-white/5 hover:text-white text-white/60"}`}>
                    <I size={16} />
                    {!collapsed && <span>{n.label}</span>}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <button onClick={async () => { await logout(); nav("/os/login"); }} data-testid="os-logout" className="m-3 flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-md text-sm transition-colors">
          <LogOut size={16} /> {!collapsed && "Déconnexion"}
        </button>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-neutral-200 h-16 flex items-center px-6 gap-4">
          <div className="flex-1 flex items-center gap-3">
            <Search size={16} className="text-neutral-400" />
            <input placeholder="Rechercher (projets, artistes, clients…)" data-testid="os-search" className="flex-1 max-w-md text-sm outline-none border-0" />
          </div>
          <button className="relative text-neutral-500 hover:text-neutral-950 transition-colors"><Bell size={18} /></button>
        </header>
        <main className="flex-1 p-6 lg:p-8 bg-[#F7F7F8] min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
