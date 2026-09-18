"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sun,
    Moon,
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
// Menu data
// ---------------------------------------------------------------------------
const menuGroups: MenuGroup[] = [
    {
        title: "MAIN",
        items: [
            { label: "Beranda", href: "/mahasiswa", icon: LayoutDashboard, exact: true },
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
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [mounted, setMounted] = useState(false);

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

    // Persist theme
    useEffect(() => {
        const savedTheme = localStorage.getItem("sidebar-theme-mahasiswa") as "dark" | "light" | null;
        if (savedTheme) setTheme(savedTheme);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem("sidebar-theme-mahasiswa", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme, mounted]);

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
    const displayEmail = user?.email || "-";
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
                className={`
                    fixed left-0 top-0 z-50 flex h-screen flex-col
                    border-r border-slate-200 bg-white
                    dark:border-white/10 dark:bg-[#0B1220]
                    transition-all duration-300 ease-in-out
                    ${sidebarWidth}
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                {/* Header: logo + collapse toggle */}
                <div
                    className={`flex h-20 items-center border-b border-slate-200 dark:border-white/10 ${
                        collapsed ? "justify-center px-0" : "justify-between px-5"
                    }`}
                >
                    {!collapsed && (
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white shadow-lg shadow-blue-600/30">
                                <img src="/images/logo-otomotif.png" alt="" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                                    Repository Otomotif
                                </h1>
                                <p className="mt-0.5 truncate text-xs font-medium text-blue-600 dark:text-blue-400">
                                    Portal Mahasiswa
                                </p>
                            </div>
                        </div>
                    )}

                    {collapsed && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white shadow-lg shadow-blue-600/30">
                            <img src="/images/logo-otomotif.png" alt="" />
                        </div>
                    )}

                    {/* Mobile close */}
                    <button
                        type="button"
                        onClick={onMobileClose}
                        className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label="Tutup menu"
                    >
                        <X size={18} />
                    </button>

                    {/* Desktop collapse toggle */}
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="ml-2 hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-all duration-300 ease-in-out hover:bg-slate-100 hover:text-slate-900 md:flex dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label="Lipat sidebar"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {/* Collapsed toggle */}
                {collapsed && (
                    <div className="hidden justify-center border-b border-slate-200 py-3 md:flex dark:border-white/10">
                        <button
                            type="button"
                            onClick={onToggle}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-300 ease-in-out hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
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
                                <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-slate-400 dark:text-slate-500">
                                    {group.title}
                                </p>
                            ) : (
                                <div className="mx-auto mb-2 w-6 border-t border-slate-200 dark:border-white/10" />
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
                                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                                                    active ? "text-white" : "text-slate-500 dark:text-slate-400"
                                                }`}
                                            >
                                                <Icon size={18} strokeWidth={2} />
                                            </span>

                                            {!collapsed && <span className="ml-1 flex-1 truncate">{item.label}</span>}

                                            {!collapsed && active && (
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                                            )}

                                            {/* Tooltip when collapsed */}
                                            {collapsed && (
                                                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 dark:bg-slate-800">
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

                {/* Footer: theme toggle + profile + logout */}
                <div className={`border-t border-slate-200 dark:border-white/10 ${collapsed ? "p-2" : "p-4"}`}>
                    {/* Theme toggle */}
                    <button
                        type="button"
                        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                        className={`
                            group relative mb-3 flex items-center rounded-xl
                            border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700
                            transition-all duration-300 ease-in-out hover:bg-slate-100
                            dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10
                            ${collapsed ? "h-10 w-10 justify-center self-center" : "w-full justify-between px-3 py-2.5"}
                        `}
                        aria-label="Ganti tema"
                    >
                        {!collapsed && (
                            <span className="flex items-center gap-2">
                                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                                {theme === "dark" ? "Mode Gelap" : "Mode Terang"}
                            </span>
                        )}

                        {collapsed ? (
                            theme === "dark" ? <Moon size={18} /> : <Sun size={18} />
                        ) : (
                            <span
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out ${
                                    theme === "dark" ? "bg-blue-600" : "bg-slate-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ease-in-out ${
                                        theme === "dark" ? "translate-x-4" : "translate-x-0.5"
                                    }`}
                                />
                            </span>
                        )}

                        {collapsed && (
                            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 dark:bg-slate-800">
                                Ganti tema
                            </span>
                        )}
                    </button>

                    {!collapsed ? (
                        <>
                            <div className="flex items-center rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                    {initialLetter}
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0B1220]" />
                                </div>
                                <div className="ml-3 min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                        {displayName}
                                    </p>
                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{displayEmail}</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition-all duration-300 ease-in-out hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                            >
                                <LogOut size={16} />
                                Keluar
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                {initialLetter}
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0B1220]" />
                                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 dark:bg-slate-800">
                                    {displayName}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all duration-300 ease-in-out hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                                aria-label="Keluar"
                            >
                                <LogOut size={16} />
                                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 dark:bg-slate-800">
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
