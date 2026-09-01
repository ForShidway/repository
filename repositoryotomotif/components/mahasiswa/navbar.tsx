"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

type MahasiswaUser = {
    name: string;
    nim?: string;
};

// Sesuaikan cara ambil data user ini dengan sistem auth kamu
// (misal dari session/context/props), ini hanya contoh placeholder
const dummyUser: MahasiswaUser = {
    name: "Mahasiswa",
    nim: "-",
};

export default function NavbarMahasiswa() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleLogout() {
        // Sesuaikan dengan mekanisme logout kamu (misal signOut(), fetch ke /api/logout, dll)
        console.log("Logout...");
    }

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* LOGO */}
                <Link href="/mahasiswa" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-100">
                        RO
                    </div>
                    <div className="leading-tight">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
                            Repository
                        </div>
                        <div className="text-sm font-bold text-slate-800">
                            Otomotif
                        </div>
                    </div>
                </Link>

                {/* USER DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-4 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {dummyUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-semibold leading-tight text-slate-800">
                                {dummyUser.name}
                            </p>
                            <p className="text-xs leading-tight text-slate-400">
                                {dummyUser.nim}
                            </p>
                        </div>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`text-slate-400 transition-transform ${
                                dropdownOpen ? "rotate-180" : ""
                            }`}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
                            <div className="border-b border-slate-100 px-4 py-3">
                                <p className="text-sm font-semibold text-slate-800">
                                    {dummyUser.name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    NIM: {dummyUser.nim}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Keluar
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}