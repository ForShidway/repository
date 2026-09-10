"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const links = [
    { label: "Beranda", href: "/" },
    { label: "Repository", href: "/jelajahirepository" },
    { label: "Dosen", href: "/dosen" },
] as const;

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/jelajahirepository?kataKunci=${encodeURIComponent(search.trim())}`);
        }
    }

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-900/[0.04]">
            <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

                {/* ── Brand ── */}
                <Link href="/" className="flex shrink-0 items-center gap-3 group">
                    <div className="relative h-11 w-11 shrink-0 transition group-hover:scale-105">
                        <img src="/images/logo-otomotif.png" alt="Logo Jurusan Otomotif" />
                    </div>
                    <div className="leading-tight hidden sm:block">
                        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">
                            Repository
                        </div>
                        <div className="text-sm font-bold text-slate-900 -mt-0.5">
                            Otomotif UNP
                        </div>
                    </div>
                </Link>

                {/* ── Nav desktop ── */}
                <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
                    {links.map((link) => {
                        const isActive =
                            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                {link.label}
                                {isActive && (
                                    <span className="absolute bottom-1 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-blue-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Search + Login ── */}
                <div className="hidden items-center gap-2.5 md:flex">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm focus-within:shadow-blue-100">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-slate-400">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Tugas Akhir..."
                            className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-800"
                        />
                    </form>

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-[#0B1F3A] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:opacity-90 hover:shadow-lg"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Masuk
                    </Link>
                </div>

                {/* ── Mobile burger ── */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* ── Mobile menu ── */}
            {menuOpen && (
                <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 md:hidden">
                    <nav className="flex flex-col gap-1 mb-3">
                        {links.map((link) => {
                            const isActive =
                                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-[#0B1F3A] py-2.5 text-sm font-semibold text-white shadow-sm"
                    >
                        Masuk
                    </Link>
                </div>
            )}
        </header>
    );
}