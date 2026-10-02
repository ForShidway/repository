"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Search,
    FolderCheck,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
    type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MenuItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
};

type MenuGroup = {
    title: string;
    items: MenuItem[];
};

type User = {
    id: number;
    name: string;
    email: string;
};

type SidebarProps = {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
};

// ---------------------------------------------------------------------------
// Menu data — Mahasiswa
// ---------------------------------------------------------------------------
const menuGroups: MenuGroup[] = [
    {
        title: "MAIN",
        items: [
            { label: "Beranda", href: "/mahasiswa", icon: LayoutDashboard, exact: true },
            { label: "Pencarian Tugas", href: "/mahasiswa/pencarian", icon: Search },
            { label: "Tugas Saya", href: "/mahasiswa/tugas-saya", icon: FolderCheck },
        ],
    },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SidebarMahasiswa({
    collapsed,
    onToggle,
    mobileOpen,
    onMobileClose,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    // Fetch user session
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/session", { cache: "no-store" });
                if (!res.ok) { setUser(null); return; }
                const data = await res.json();
                setUser(data.user ?? null);
            } catch {
                setUser(null);
            }
        }
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleMenuClick = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            onMobileClose();
        }
    };

    const sidebarWidth = collapsed ? "w-[76px]" : "w-[268px]";
    const displayName = user?.name || "Mahasiswa";
    const displayEmail = user?.email || "mahasiswa@otomotif.ac.id";
    const initialLetter = displayName.charAt(0).toUpperCase();

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
                    onClick={onMobileClose}
                />
            )}

            <aside
                style={{
                    background: "linear-gradient(180deg, #132454 0%, #0D1C42 45%, #08132d 100%)",
                }}
                className={`
                    fixed left-0 top-0 z-50 flex h-screen flex-col
                    border-r border-white/10
                    transition-all duration-300 ease-in-out
                    ${sidebarWidth}
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                    rounded-r-3xl
                `}
            >
                {/* Header: logo + collapse toggle */}
                <div
                    className={`flex h-20 items-center border-b border-white/10 ${
                        collapsed ? "justify-center px-0" : "justify-between px-5"
                    }`}
                >
                    {!collapsed && (
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-lg">
                                <img src="/images/logo-otomotif.png" alt="" className="h-8 w-8 object-contain" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-sm font-bold tracking-tight text-white">
                                    Repository Otomotif
                                </h1>
                                <p className="mt-0.5 truncate text-xs font-medium text-blue-300">
                                    Portal Mahasiswa
                                </p>
                            </div>
                        </div>
                    )}

                    {collapsed && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-lg">
                            <img src="/images/logo-otomotif.png" alt="" className="h-8 w-8 object-contain" />
                        </div>
                    )}

                    {/* Mobile close */}
                    <button
                        type="button"
                        onClick={onMobileClose}
                        className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white md:hidden"
                        aria-label="Tutup menu"
                    >
                        <X size={18} />
                    </button>

                    {/* Desktop collapse toggle */}
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="ml-2 hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition-all duration-300 ease-in-out hover:bg-white/10 hover:text-white md:flex"
                            aria-label="Lipat sidebar"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {/* Collapsed toggle */}
                {collapsed && (
                    <div className="hidden justify-center border-b border-white/10 py-3 md:flex">
                        <button
                            type="button"
                            onClick={onToggle}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-all duration-300 ease-in-out hover:bg-white/10 hover:text-white"
                            aria-label="Lebarkan sidebar"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-5 ${collapsed ? "px-2" : "px-3"}`}>
                    {menuGroups.map((group) => (
                        <div key={group.title} className="mb-6">
                            {!collapsed ? (
                                <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-white/50">
                                    {group.title}
                                </p>
                            ) : (
                                <div className="mx-auto mb-2 w-6 border-t border-white/20" />
                            )}

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = item.exact
                                        ? pathname === item.href
                                        : pathname === item.href || pathname.startsWith(`${item.href}/`);
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={handleMenuClick}
                                            className={`
                                                group relative flex items-center rounded-xl
                                                text-sm font-semibold
                                                transition-all duration-300 ease-in-out
                                                ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                                                ${
                                                    active
                                                        ? "bg-white text-[#0D1C42] shadow-lg shadow-black/10"
                                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                                                    active ? "text-[#0D1C42]" : "text-white/70"
                                                }`}
                                            >
                                                <Icon size={18} strokeWidth={2} />
                                            </span>

                                            {!collapsed && <span className="ml-1 flex-1 truncate">{item.label}</span>}

                                            {/* Active indicator dot */}
                                            {!collapsed && active && (
                                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#0D1C42]" />
                                            )}

                                            {/* Tooltip when collapsed */}
                                            {collapsed && (
                                                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
                                                    {item.label}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer: profile + logout */}
                <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-4"}`}>
                    {!collapsed ? (
                        <>
                            <div className="flex items-center rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                    {initialLetter}
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0D1C42] bg-emerald-400" />
                                </div>
                                <div className="ml-3 min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {displayName}
                                    </p>
                                    <p className="truncate text-xs text-white/60">{displayEmail}</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-white/20 hover:text-white"
                            >
                                <LogOut size={16} />
                                Keluar
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                {initialLetter}
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0D1C42] bg-emerald-400" />
                                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
                                    {displayName}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="group relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-all duration-300 ease-in-out hover:bg-white/20 hover:text-white"
                                aria-label="Keluar"
                            >
                                <LogOut size={16} />
                                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
                                    Keluar
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
