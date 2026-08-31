"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
    label: string;
    href: string;
    icon: React.ReactNode;
};

type MenuGroup = {
    title: string;
    items: MenuItem[];
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
};

const menuGroups: MenuGroup[] = [
    {
        title: "MAIN",
        items: [
            { label: "Beranda", href: "/admin/dashboard", icon: icons.dashboard },
        ],
    },
    {
        title: "KELOLA DATA",
        items: [
            { label: "Tugas Akhir", href: "/admin/tugas-akhirs", icon: icons.tugasAkhir },
            { label: "Dosen", href: "/admin/dosens", icon: icons.dosen },
            { label: "Ruangan", href: "/admin/ruangans", icon: icons.ruangan },
            { label: "Program Studi", href: "/admin/program-studies", icon: icons.programStudi },
            { label: "Mata Kuliah", href: "/admin/mata-kuliahs", icon: icons.mataKuliah },
            { label: "SDGs", href: "/admin/sdgs", icon: icons.sdgs },
        ],
    },
    {
        title: "SISTEM",
        items: [
            { label: "Pengguna", href: "/admin/users", icon: icons.pengguna },
            { label: "Pengaturan", href: "/admin/pengaturan", icon: icons.pengaturan },
            { label: "Log Aktivitas", href: "/admin/log-aktivitas", icon: icons.logAktivitas },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

            {/* Logo */}
            <div className="flex h-20 items-center border-b border-slate-100 px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h1 className="text-sm font-bold tracking-tight text-slate-900">
                        Repository Otomotif
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Admin Panel
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-5">
                {menuGroups.map((group) => (
                    <div key={group.title} className="mb-6">
                        <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.15em] text-slate-400">
                            {group.title}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active =
                                    pathname === item.href ||
                                    pathname.startsWith(`${item.href}/`);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            group flex items-center rounded-xl px-3 py-2.5
                                            text-sm font-medium transition-all duration-200
                                            ${
                                                active
                                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                flex h-9 w-9 items-center justify-center
                                                rounded-lg transition
                                                ${
                                                    active
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                                }
                                            `}
                                        >
                                            {item.icon}
                                        </span>

                                        <span className="ml-3 flex-1">
                                            {item.label}
                                        </span>

                                        {active && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Admin Profile */}
            <div className="border-t border-slate-100 p-4">
                <div className="flex items-center rounded-xl bg-slate-50 p-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        A
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="ml-3 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                            Administrator
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            Super Admin
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Keluar
                </button>
            </div>

        </aside>
    );
}