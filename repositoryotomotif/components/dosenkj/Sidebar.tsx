"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const icons = {
    dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    ),
    dosen: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),
    statistik: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    tugasAkhir: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    grafik: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
};

const menuGroups: MenuGroup[] = [
    {
        title: "MAIN",
        items: [
            { label: "Dashboard", href: "/dosen", icon: icons.dashboard },
        ],
    },
    {
        title: "STATISTIK DOSEN",
        items: [
            { label: "Grafik & Analisis", href: "/dosen/statistik", icon: icons.grafik },
        ],
    },
];

const ToggleIcon = ({ collapsed }: { collapsed: boolean }) => (
    <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
    >
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

export default function SidebarDosen({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch("/api/auth/session", { cache: "no-store" });
                if (!response.ok) { setUser(null); return; }
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

    const displayName = user?.name || "Dosen";
    const displayEmail = user?.email || "-";
    const initialLetter = displayName.charAt(0)?.toUpperCase() || "D";

    const sidebarWidth = collapsed ? "w-[72px]" : "w-[272px]";

    // accent color: teal/green untuk membedakan dari sidebar lain
    const accentFrom = "from-teal-600";
    const accentTo = "to-[#0B3A3A]";
    const accentText = "text-teal-600";
    const accentBg = "bg-teal-50";
    const accentIcon = "bg-teal-100 text-teal-600";
    const accentAvatar = "bg-teal-600";

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
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
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentFrom} ${accentTo} text-sm font-extrabold text-white shadow-md`}>
                                 <img src="/images/logo-otomotif.png" alt="Logo Jurusan Otomotif" />
                            </div>
                            <div className="ml-3 min-w-0">
                                <div className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accentText}`}>
                                    Portal Dosen
                                </div>
                                <div className="text-sm font-bold text-slate-900 -mt-0.5">
                                    Otomotif UNP
                                </div>
                            </div>
                        </div>
                    )}

                    {collapsed && (
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentFrom} ${accentTo} text-xs font-extrabold text-white shadow-md`}>
                             <img src="/images/logo-otomotif.png" alt="Logo Jurusan Otomotif" />
                        </div>
                    )}

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
                <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
                    {menuGroups.map((group) => (
                        <div key={group.title} className="mb-5">
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
                                    // Dashboard aktif hanya di /dosen exact, item lain pakai startsWith
                                    const active =
                                        item.href === "/dosen"
                                            ? pathname === "/dosen"
                                            : pathname === item.href || pathname.startsWith(`${item.href}/`);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={handleMenuClick}
                                            className={`
                                                group relative flex items-center rounded-xl
                                                text-sm font-medium transition-all duration-150
                                                ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                                                ${active
                                                    ? `${accentBg} ${accentText}`
                                                    : "text-slate-500 hover:bg-slate-50 hover:text-teal-600"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    flex h-8 w-8 items-center justify-center
                                                    rounded-lg transition shrink-0
                                                    ${active
                                                        ? accentIcon
                                                        : "text-slate-400 group-hover:text-teal-500"
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
                                                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                                            )}

                                            {/* Tooltip for collapsed */}
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
                                <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accentAvatar} text-sm font-extrabold text-white`}>
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
                            <div className={`sidebar-menu-item relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accentAvatar} text-sm font-extrabold text-white`}>
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
