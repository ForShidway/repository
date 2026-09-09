"use client";

import { User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type User = {
    id: number;
    name: string;
    email: string;
};

export default function NavbarMahasiswa() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    const displayName = user?.name || "Mahasiswa";
    const displayEmail = user?.email || "-";
    const initialLetter = displayName.charAt(0)?.toUpperCase() || "M";

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-900/[0.04]">
            <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/mahasiswa" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-[#0B1F3A] text-sm font-extrabold text-white shadow-md shadow-blue-900/20 transition group-hover:shadow-lg">
                        RO
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

                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-4 transition hover:border-blue-200 hover:bg-blue-50 shadow-sm"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-extrabold text-white">
                            {initialLetter}
                        </div>
                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-semibold leading-tight text-slate-800">
                                {displayName}
                            </p>
                            <p className="text-xs leading-tight text-slate-400">
                                {displayEmail}
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
                                    {displayName}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {displayEmail}
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