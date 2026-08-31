"use client";

import Link from "next/link";

export function NavbarMahasiswa() {
    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                
                {/* Logo & Judul Kiri */}
                <Link href="/mahasiswa" className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-bold text-slate-900">Repository Otomotif</div>
                        <div className="text-xs text-slate-500">Politeknik Negeri Malang</div>
                    </div>
                </Link>

                {/* Identitas Login Mahasiswa Kanan */}
                <div className="flex items-center gap-4">
                    {/* Teks Identitas */}
                    <div className="hidden text-right md:block">
                        <div className="text-sm font-bold text-slate-900">Nama</div>
                        <div className="text-xs font-medium text-slate-500">NIM: 21312456</div>
                    </div>
                    
                    {/* Avatar */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>

                    {/* Tombol Logout (Opsional tapi penting untuk UX) */}
                    <button className="ml-2 flex items-center justify-center rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Keluar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>

            </div>
        </header>
    );
}