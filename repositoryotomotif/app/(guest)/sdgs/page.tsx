"use client";

import { useEffect, useState } from "react";
import SdgsRadarChart from "@/components/guest/SdgsRadarChart";

type SdgItem = {
    id: number;
    code: string;
    title: string;
    description: string | null;
    jumlahTA: number;
    jumlahArtikel: number;
    jumlahTotal: number;
};

// Warna-warna resmi SDGs (per goal 1-17)
const SDG_COLORS: Record<string, string> = {
    "1": "#e5243b", "2": "#DDA63A", "3": "#4C9F38", "4": "#C5192D",
    "5": "#FF3A21", "6": "#26BDE2", "7": "#FCC30B", "8": "#A21942",
    "9": "#FD6925", "10": "#DD1367", "11": "#FD9D24", "12": "#BF8B2E",
    "13": "#3F7E44", "14": "#0A97D9", "15": "#56C02B", "16": "#00689D",
    "17": "#19486A",
};

function getSdgColor(code: string): string {
    const num = code.replace(/\D/g, "");
    return SDG_COLORS[num] || "#64748b";
}

export default function GuestSdgsPage() {
    const [sdgs, setSdgs] = useState<SdgItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchSdgs() {
            try {
                setLoading(true);
                setError("");
                const response = await fetch("/api/guest/sdgs");
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Gagal mengambil data SDGs");
                }
                setSdgs(data);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchSdgs();
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-[calc(100vh-72px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800" />
                    <p className="text-sm text-slate-500">Memuat data SDGs...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-md">
                    <p className="text-red-600 font-semibold">{error}</p>
                </div>
            </main>
        );
    }

    const totalTA = sdgs.reduce((sum, s) => sum + s.jumlahTA, 0);
    const totalArtikel = sdgs.reduce((sum, s) => sum + s.jumlahArtikel, 0);

    return (
        <main className="min-h-[calc(100vh-72px)]">
            {/* ── Hero Section ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#132D52] to-[#1a3a66] py-16 sm:py-20">
                {/* Decorative circles */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-200 backdrop-blur-sm border border-white/10">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                            <path d="M2 12h20" />
                        </svg>
                        Sustainable Development Goals
                    </div>
                    <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        SDGs pada Repository
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
                        Lihat bagaimana Tugas Akhir dan Artikel Jurnal di repository ini berkontribusi 
                        pada Sustainable Development Goals (SDGs) yang ditetapkan oleh PBB.
                    </p>

                    {/* Stats pills */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/10">
                            <span className="h-2 w-2 rounded-full bg-blue-400" />
                            <span className="text-sm font-semibold text-white">{totalTA}</span>
                            <span className="text-xs text-slate-300">Tugas Akhir</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/10">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-sm font-semibold text-white">{totalArtikel}</span>
                            <span className="text-xs text-slate-300">Artikel Jurnal</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/10">
                            <span className="h-2 w-2 rounded-full bg-orange-400" />
                            <span className="text-sm font-semibold text-white">{sdgs.length}</span>
                            <span className="text-xs text-slate-300">SDGs Aktif</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

                {/* ── SDGs Info Table ── */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Informasi SDGs
                            </h2>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Daftar Sustainable Development Goals beserta deskripsi
                            </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
                            {sdgs.length} SDGs
                        </span>
                    </div>

                    {sdgs.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm text-slate-400">Belum ada data SDGs.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">SDGs</th>
                                        <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Deskripsi</th>
                                        <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Tugas Akhir</th>
                                        <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Artikel</th>
                                        <th className="px-6 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sdgs.map((sdg) => (
                                        <tr key={sdg.id} className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                                                        style={{ backgroundColor: getSdgColor(sdg.code) }}
                                                    >
                                                        {sdg.code.replace(/\D/g, "")}
                                                    </span>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400">{sdg.code}</p>
                                                        <p className="text-sm font-semibold text-slate-800 leading-snug">{sdg.title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                                                    {sdg.description || <span className="text-slate-400 italic">Tidak ada deskripsi</span>}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                                    {sdg.jumlahTA}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                    {sdg.jumlahArtikel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                    {sdg.jumlahTotal}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* ── Radar Chart Section ── */}
                <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900">
                            Diagram Distribusi SDGs
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Sebaran jumlah Tugas Akhir dan Artikel Jurnal berdasarkan Sustainable Development Goals
                        </p>
                    </div>
                    <div className="px-6 py-6">
                        <SdgsRadarChart data={sdgs} />
                    </div>
                </section>

                {/* ── SDGs Summary Cards ── */}
                {sdgs.length > 0 && (
                    <section className="mt-8">
                        <h2 className="mb-5 text-lg font-bold text-slate-900">Ringkasan per SDGs</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {sdgs.filter((s) => s.jumlahTotal > 0).map((sdg) => {
                                const pctTA = sdg.jumlahTotal > 0 ? Math.round((sdg.jumlahTA / sdg.jumlahTotal) * 100) : 0;
                                const pctArtikel = 100 - pctTA;
                                return (
                                    <div key={sdg.id} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                                        <div className="flex items-start gap-3">
                                            <span
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
                                                style={{ backgroundColor: getSdgColor(sdg.code) }}
                                            >
                                                {sdg.code.replace(/\D/g, "")}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-400">{sdg.code}</p>
                                                <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{sdg.title}</p>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="mt-4">
                                            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                                                {pctTA > 0 && (
                                                    <div
                                                        className="bg-blue-500 transition-all duration-500"
                                                        style={{ width: `${pctTA}%` }}
                                                    />
                                                )}
                                                {pctArtikel > 0 && (
                                                    <div
                                                        className="bg-emerald-500 transition-all duration-500"
                                                        style={{ width: `${pctArtikel}%` }}
                                                    />
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                    TA: {sdg.jumlahTA}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Artikel: {sdg.jumlahArtikel}
                                                </span>
                                                <span className="font-bold text-slate-700">
                                                    Total: {sdg.jumlahTotal}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {sdgs.every((s) => s.jumlahTotal === 0) && (
                            <p className="mt-4 text-center text-sm text-slate-400">
                                Belum ada Tugas Akhir atau Artikel Jurnal yang dikaitkan dengan SDGs.
                            </p>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}
