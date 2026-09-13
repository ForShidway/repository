"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Dosen = {
    id: number;
    name: string;
};

const PER_PAGE = 10;

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
    icon,
    label,
    value,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</p>
                <p className="text-sm font-medium text-slate-500">{label}</p>
            </div>
        </div>
    );
}

export default function DosenDashboardPage() {
    const router = useRouter();

    const [dosens, setDosens] = useState<Dosen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [kataKunci, setKataKunci] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function fetchDosens() {
            try {
                setLoading(true);
                setError("");
                const response = await fetch("/api/dosens");
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Gagal mengambil data dosen");
                setDosens(data);
            } catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchDosens();
    }, []);

    const filtered = useMemo(() => {
        if (!kataKunci) return dosens;
        const lq = kataKunci.toLowerCase();
        return dosens.filter((d) => d.name.toLowerCase().includes(lq));
    }, [dosens, kataKunci]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="min-h-screen bg-[#F4F9F9]">
            {/* ── Top bar ── */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-xl shadow-sm">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Portal Dosen</p>
                    <h1 className="text-base font-extrabold text-slate-900 leading-tight">Dashboard</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                        Role: Dosen
                    </span>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Welcome Section ── */}
                <section className="mb-8 rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-600 to-[#0B3A3A] px-8 py-7 shadow-lg">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200 mb-1">Selamat Datang</p>
                    <h2 className="text-2xl font-extrabold text-white mb-2">Portal Statistik Dosen</h2>
                    <p className="text-sm text-teal-100 max-w-lg leading-6">
                        Lihat statistik bimbingan, Tugas Akhir, dan data akademik dosen Jurusan Teknik Otomotif UNP.
                    </p>
                </section>

                {/* ── Stats ── */}
                {!loading && (
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            label="Total Dosen"
                            value={dosens.length}
                            accent="bg-teal-50 text-teal-600"
                            icon={
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                    <path d="M16 3.13a4 4 0 010 7.75" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Hasil Pencarian"
                            value={filtered.length}
                            accent="bg-blue-50 text-blue-600"
                            icon={
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Halaman"
                            value={`${page} / ${totalPages || 1}`}
                            accent="bg-orange-50 text-orange-600"
                            icon={
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <line x1="3" y1="9" x2="21" y2="9" />
                                    <line x1="9" y1="21" x2="9" y2="9" />
                                </svg>
                            }
                        />
                    </div>
                )}

                {/* ── Section Header ── */}
                <section className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Daftar Dosen Pembimbing</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Klik baris dosen untuk melihat statistik bimbingan lengkap.
                        </p>
                    </div>
                </section>

                {/* ── Search ── */}
                <div className="mb-4">
                    <div className="relative max-w-sm">
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            value={kataKunci}
                            onChange={(e) => { setKataKunci(e.target.value); setPage(1); }}
                            placeholder="Cari nama dosen..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                        />
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* ── Loading ── */}
                {loading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                        <p className="text-sm text-slate-500">Memuat daftar dosen...</p>
                    </div>
                )}

                {/* ── Empty ── */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <p className="font-medium text-slate-700">
                            {kataKunci ? "Tidak ada dosen yang cocok dengan pencarian." : "Belum ada data dosen."}
                        </p>
                    </div>
                )}

                {/* ── Table ── */}
                {!loading && paged.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="w-16 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">No</th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Nama Dosen</th>
                                    <th className="w-48 px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map((dosen, idx) => (
                                    <tr
                                        key={dosen.id}
                                        onClick={() => router.push(`/dosen/${dosen.id}`)}
                                        className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-teal-50/40"
                                    >
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">
                                            {(page - 1) * PER_PAGE + idx + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-extrabold text-teal-700">
                                                    {dosen.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-900">{dosen.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-800">
                                                Lihat Statistik
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                        >
                            Kembali
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${page === p
                                    ? "bg-teal-600 text-white"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                        >
                            Lanjut
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}