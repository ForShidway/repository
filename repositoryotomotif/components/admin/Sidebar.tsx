"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

type MenuItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
};

type MenuGroup = {
    title: string;
    items: MenuItem[];
};

type SidebarProps = {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
};

// --- ICONS (SVG outline, konsisten 20x20) ---
const icons = {
    dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
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
    dosen: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),

    ruangan: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
            <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
        </svg>
    ),
    programStudi: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    ),
    mataKuliah: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
    ),
    sdgs: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    ),
    pengguna: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    pengaturan: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
    logAktivitas: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
    ),
    artikelJurnal: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            <path d="M9 7h7M9 11h7M9 15h5" />
        </svg>
    ),
    laporanPi: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 3h7l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            <path d="M14 3v5h5" />
            <path d="M8 13h8M8 17h8" />
        </svg>
    ),
    laporanPlk: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16" />
            <path d="M7 12h10" />
            <path d="M10 17h4" />
            <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
    ),
};

const menuGroups: MenuGroup[] = [
    {
        title: "MAIN",
        items: [
            { label: "Beranda", href: "/admin", icon: icons.dashboard },
        ],
    },
    {
        title: "KELOLA DATA",
        items: [
            { label: "Tugas Akhir", href: "/admin/tugas-akhirs", icon: icons.tugasAkhir },
            { label: "Artikel Jurnal", href: "/admin/artikel-jurnals", icon: icons.artikelJurnal },
            { label: "Laporan PI", href: "/admin/laporan-pi", icon: icons.laporanPi },
            { label: "Laporan PLK", href: "/admin/laporan-plk", icon: icons.laporanPlk },
            { label: "Dosen", href: "/admin/dosens", icon: icons.dosen },
            { label: "Ruangan", href: "/admin/ruangans", icon: icons.ruangan },
            { label: "Program Studi", href: "/admin/program-studies", icon: icons.programStudi },
            { label: "SDGs", href: "/admin/sdgs", icon: icons.sdgs },
        ],
    },
    {
        title: "SISTEM",
        items: [
            { label: "Pengguna", href: "/admin/users", icon: icons.pengguna },

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

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

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
        // Close sidebar on mobile when a menu item is clicked
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            onMobileClose();
        }
    };

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
                    border-r border-white/5 bg-[#0B1F3A]
                    transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                    ${sidebarWidth}
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >

                {/* Logo + Toggle */}
                <div className={`flex h-20 items-center border-b border-white/10 ${collapsed ? "justify-center px-0" : "px-5"}`}>
                    {!collapsed && (
                        <div className="flex items-center min-w-0 flex-1">
                             <div className="relative h-11 w-11 shrink-0 transition group-hover:scale-105">
                                <img src="/images/logo-otomotif.png" alt="Logo Jurusan Otomotif" />
                            </div>
                            <div className="ml-3 min-w-0">
                                <h1 className="text-sm font-bold tracking-tight text-white truncate">
                                    Repository Otomotif
                                </h1>
                                <p className="mt-0.5 text-xs text-blue-300/70">
                                    Admin Panel
                                </p>
                            </div>
                        </div>
                    )}

                    {collapsed && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-extrabold text-white shadow-lg shadow-blue-900/40">
                             <img src="/images/logo-otomotif.png" alt="Logo Jurusan Otomotif" />
                        </div>
                    )}

                    {/* Desktop toggle button - hidden on mobile */}
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="ml-2 hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                            aria-label="Toggle sidebar"
                        >
                            <ToggleIcon collapsed={collapsed} />
                        </button>
                    )}
                </div>

                {/* Collapsed toggle button below logo */}
                {collapsed && (
                    <div className="hidden md:flex justify-center py-3 border-b border-white/5">
                        <button
                            type="button"
                            onClick={onToggle}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
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
                            {/* Group title - hidden when collapsed */}
                            {!collapsed && (
                                <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-500 uppercase">
                                    {group.title}
                                </p>
                            )}
                            {collapsed && (
                                <div className="mb-2 mx-auto w-6 border-t border-white/10" />
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
                                                        ? "bg-blue-600/20 text-white"
                                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    flex h-8 w-8 items-center justify-center
                                                    rounded-lg transition shrink-0
                                                    ${
                                                        active
                                                            ? "bg-blue-500 text-white shadow-md shadow-blue-900/40"
                                                            : "text-slate-500 group-hover:text-slate-300"
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
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                            )}

                                            {/* Tooltip for collapsed mode */}
                                            {collapsed && (
                                                <span className="sidebar-tooltip sidebar-tooltip-dark">
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

                {/* Admin Profile */}
                <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-4"}`}>
                    {!collapsed ? (
                        <>
                            <div className="flex items-center rounded-xl bg-white/5 p-3">
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/30 font-bold text-blue-300">
                                    A
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0B1F3A] bg-emerald-400" />
                                </div>
                                <div className="ml-3 min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        Administrator
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                        Super Admin
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button" onClick={handleLogout}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/40 bg-red-900/20 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-900/30 hover:text-red-300"
                            >
                                <LogoutIcon />
                                Keluar
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="sidebar-menu-item relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/30 font-bold text-blue-300">
                                A
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0B1F3A] bg-emerald-400" />
                                <span className="sidebar-tooltip sidebar-tooltip-dark">Administrator</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="sidebar-menu-item relative flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/40 bg-red-900/20 text-red-400 transition hover:bg-red-900/30 hover:text-red-300"
                                aria-label="Keluar"
                            >
                                <LogoutIcon />
                                <span className="sidebar-tooltip sidebar-tooltip-dark">Keluar</span>
                            </button>
                        </div>
                    )}
                </div>

            </aside>
        </>
    );
}