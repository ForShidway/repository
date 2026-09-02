"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
    { label: "Beranda", href: "/" },
    { label: "Repository", href: "/jelajahirepository" },
    { label: "Dosen", href: "/dosen" },

] as const;

export function Navbar() {
    const pathname = usePathname();
    const [search, setSearch] = useState("");

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-bold text-slate-900">Repository Otomotif</div>
                        <div className="text-xs text-slate-500">Universitas  Negeri Padang</div>
                    </div>
                </Link>

                {/* Menu desktop */}
                <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
                    {links.map((link) => {
                        const isActive =
                            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative pb-1 text-sm font-semibold transition ${
                                    isActive
                                        ? "text-blue-600 after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-full after:bg-blue-600"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Search + Login */}
                <div className="hidden items-center gap-3 md:flex">
                    <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Tugas Akhir..."
                            className="w-40 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400"
                        />
                    </div>

                    <Link
                        href="/login"
                        className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Login
                    </Link>
                </div>
            </div>
        </header>
    );
}