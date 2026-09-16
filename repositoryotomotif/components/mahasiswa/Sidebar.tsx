"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MenuItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
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

// --- ICONS (SVG outline, konsisten 18x18) ---
const icons = {
    dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    ),
};

const menuGroups: MenuGroup[] = [
    {
        title: "MAIN",
        items: [
            { label: "Beranda", href: "/mahasiswa", icon: icons.dashboard },
        ],
    },
    
];

// Toggle icon (chevron left/right)
const ToggleIcon = ({ collapsed }: { collapsed: boolean }) => (
    <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
    >
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

// Logout icon
const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

export default function SidebarMahasiswa({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch("/api/auth/session", {
                    cache: "no-store",
                });
                if (!response.ok) {
                    setUser(null);
                    return;
                }
                const data = await response.json();
                setUser(data.user ?? null);
            } catch (error) {
                console.error("Gagal mengambil user session:", error);
                setUser(null);
            }
        }
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
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

    const displayName = user?.name || "Mahasiswa";
    const displayEmail = user?.email || "-";
    const initialLetter = displayName.charAt(0)?.toUpperCase() || "M";

    const sidebarWidth = collapsed ? "w-[72px]" : "w-[272px]";

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay md:hidden"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 z-50 flex h-screen flex-col
                    border-r border-slate-200/80 bg-white
                    transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                    ${sidebarWidth}
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >

                {/* Logo + Toggle */}
                <div className={`flex h-20 items-center border-b border-slate-100 ${collapsed ? "justify-center px-0" : "px-5"}`}>
                    {!collapsed && (
                        <div className="flex items-center min-w-0 flex-1">
                            <div className="relative h-11 w-11 shrink-0 transition group-hover:scale-105">
                                <img src="/images/logo-otomotif.png" alt="Logo Jurusan Otomotif" />
                            </div>
                            <div className="ml-3 min-w-0">
                                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">
                                    Repository
                                </div>
                                <div className="text-sm font-bold text-slate-900 -mt-0.5">
                                    Otomotif UNP
                                </div>
                            </div>
                        </div>
                    )}

                    {collapsed && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-[#0B1F3A] text-xs font-extrabold text-white shadow-md shadow-blue-900/20">
                             <img src="/images/logo-otomotif.png" alt="Logo Jurusan Otomotif" />
                        </div>
                    )}

                    {/* Desktop toggle button */}
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="ml-2 hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Toggle sidebar"
                        >
                            <ToggleIcon collapsed={collapsed} />
                        </button>
                    )}
                </div>

                {/* Collapsed toggle button */}
                {collapsed && (
                    <div className="hidden md:flex justify-center py-3 border-b border-slate-100">
                        <button
                            type="button"
                            onClick={onToggle}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Toggle sidebar"
                        >
                            <ToggleIcon collapsed={collapsed} />
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <nav className={`flex-1 overflow-y-auto py-5 ${collapsed ? "px-2" : "px-3"}`}>
                    {menuGroups.map((group) => (
                        <div key={group.title} className="mb-6">
                            {/* Group title */}
                            {!collapsed && (
                                <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                                    {group.title}
                                </p>
                            )}
                            {collapsed && (
                                <div className="mb-2 mx-auto w-6 border-t border-slate-200" />
                            )}

                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const active =
                                        pathname === item.href ||
                                        pathname.startsWith(`${item.href}/`);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={handleMenuClick}
                                            className={`
                                                sidebar-menu-item group relative flex items-center rounded-xl
                                                text-sm font-medium transition-all duration-150
                                                ${collapsed
                                                    ? "justify-center px-0 py-2.5"
                                                    : "px-3 py-2.5"
                                                }
                                                ${
                                                    active
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    flex h-8 w-8 items-center justify-center
                                                    rounded-lg transition shrink-0
                                                    ${
                                                        active
                                                            ? "bg-blue-100 text-blue-600"
                                                            : "text-slate-400 group-hover:text-blue-500"
                                                    }
                                                `}
                                            >
                                                {item.icon}
                                            </span>

                                            {!collapsed && (
                                                <span className="ml-3 flex-1 truncate">
                                                    {item.label}
                                                </span>
                                            )}

                                            {!collapsed && active && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            )}

                                            {/* Tooltip for collapsed mode */}
                                            {collapsed && (
                                                <span className="sidebar-tooltip sidebar-tooltip-light">
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

                {/* User Profile */}
                <div className={`border-t border-slate-100 ${collapsed ? "p-2" : "p-4"}`}>
                    {!collapsed ? (
                        <>
                            <div className="flex items-center rounded-xl bg-slate-50 p-3">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-extrabold text-white">
                                    {initialLetter}
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                                </div>
                                <div className="ml-3 min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                        {displayName}
                                    </p>
                                    <p className="truncate text-xs text-slate-400">
                                        {displayEmail}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button" onClick={handleLogout}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-100 hover:text-red-600"
                            >
                                <LogoutIcon />
                                Keluar
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="sidebar-menu-item relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-extrabold text-white">
                                {initialLetter}
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                                <span className="sidebar-tooltip sidebar-tooltip-light">{displayName}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="sidebar-menu-item relative flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-600"
                                aria-label="Keluar"
                            >
                                <LogoutIcon />
                                <span className="sidebar-tooltip sidebar-tooltip-light">Keluar</span>
                            </button>
                        </div>
                    )}
                </div>

            </aside>
        </>
    );
}
