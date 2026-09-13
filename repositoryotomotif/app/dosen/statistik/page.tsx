"use client";

import { useEffect, useState } from "react";

type DosenStat = {
    id: number;
    name: string;
    pembimbingUtama: number;
    pembimbingPendamping: number;
    dosenPa: number;
    penguji: number;
    pembimbingPi: number;
    pembimbingPlk: number;
    penulisArtikel: number;
};

type DashboardData = {
    summary: {
        totalDosen: number;
        totalTugasAkhir: number;
        totalLaporanPi: number;
        totalLaporanPlk: number;
        totalArtikelJurnal: number;
    };
    topDosen: (DosenStat & { totalBimbingan: number })[];
    dosenList: DosenStat[];
};

// ── Bar chart sederhana (CSS) ──────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max === 0 ? 0 : Math.round((value / max) * 100);
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-slate-100">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-6 text-right text-xs font-bold text-slate-600">{value}</span>
        </div>
    );
}

export default function DosenStatistikPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch("/api/dosen/dashboard");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal mengambil data");
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const maxBimbingan = data?.topDosen?.[0]?.totalBimbingan ?? 1;

    return (
        <div className="min-h-screen bg-[#F4F9F9]">
            {/* Top bar */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-xl shadow-sm">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Portal Dosen</p>
                    <h1 className="text-base font-extrabold text-slate-900 leading-tight">Grafik & Analisis</h1>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Loading */}
                {loading && (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {data && (
                    <>
                        {/* ── Ringkasan Statistik ── */}
                        <section className="mb-8">
                            <h2 className="mb-4 text-lg font-bold text-slate-900">Ringkasan Repository</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                {[
                                    { label: "Total Dosen", value: data.summary.totalDosen, color: "bg-teal-500" },
                                    { label: "Tugas Akhir", value: data.summary.totalTugasAkhir, color: "bg-blue-500" },
                                    { label: "Laporan PI", value: data.summary.totalLaporanPi, color: "bg-indigo-500" },
                                    { label: "Laporan PLK", value: data.summary.totalLaporanPlk, color: "bg-purple-500" },
                                    { label: "Artikel Jurnal", value: data.summary.totalArtikelJurnal, color: "bg-orange-500" },
                                ].map((s) => (
                                    <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                                        <div className={`mx-auto mb-2 h-1.5 w-12 rounded-full ${s.color}`} />
                                        <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── Top 5 Dosen ── */}
                        <section className="mb-8">
                            <h2 className="mb-4 text-lg font-bold text-slate-900">Top 5 Dosen Pembimbing Terbanyak</h2>
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="px-6 pt-5 pb-4 grid gap-4">
                                    {data.topDosen.map((d, i) => (
                                        <div key={d.id} className="grid grid-cols-[auto_1fr] gap-4 items-center">
                                            <div className="flex items-center gap-3 w-56">
                                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${i === 0 ? "bg-yellow-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-slate-300"}`}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-800 truncate">{d.name}</span>
                                            </div>
                                            <div>
                                                <MiniBar value={d.totalBimbingan} max={maxBimbingan} color="bg-teal-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ── Tabel Detail ── */}
                        <section>
                            <h2 className="mb-4 text-lg font-bold text-slate-900">Detail Bimbingan Semua Dosen</h2>
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50">
                                            <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Nama Dosen</th>
                                            <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Bimb. 1</th>
                                            <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Bimb. 2</th>
                                            <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">PA</th>
                                            <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Penguji</th>
                                            <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">PI</th>
                                            <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">PLK</th>
                                            <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Artikel</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.dosenList.map((d) => (
                                            <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-teal-50/30 transition">
                                                <td className="px-5 py-3.5 font-semibold text-slate-900">{d.name}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${d.pembimbingUtama > 0 ? "bg-teal-100 text-teal-700" : "text-slate-300"}`}>
                                                        {d.pembimbingUtama}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${d.pembimbingPendamping > 0 ? "bg-blue-100 text-blue-700" : "text-slate-300"}`}>
                                                        {d.pembimbingPendamping}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${d.dosenPa > 0 ? "bg-indigo-100 text-indigo-700" : "text-slate-300"}`}>
                                                        {d.dosenPa}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${d.penguji > 0 ? "bg-purple-100 text-purple-700" : "text-slate-300"}`}>
                                                        {d.penguji}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${d.pembimbingPi > 0 ? "bg-orange-100 text-orange-700" : "text-slate-300"}`}>
                                                        {d.pembimbingPi}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${d.pembimbingPlk > 0 ? "bg-pink-100 text-pink-700" : "text-slate-300"}`}>
                                                        {d.pembimbingPlk}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${d.penulisArtikel > 0 ? "bg-amber-100 text-amber-700" : "text-slate-300"}`}>
                                                        {d.penulisArtikel}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
