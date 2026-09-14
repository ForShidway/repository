"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SdgsRadarChart from "@/components/guest/SdgsRadarChart";

type SdgItem = {
    id: number;
    code: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    jumlahTA: number;
    jumlahArtikel: number;
    jumlahTotal: number;
};

// Warna Resmi SDGs PBB (Goal 1 s/d 17)
const SDG_COLORS: Record<string, string> = {
    "1": "#E5243B",
    "2": "#DDA63A",
    "3": "#4C9F38",
    "4": "#C5192D",
    "5": "#FF3A21",
    "6": "#26BDE2",
    "7": "#FCC30B",
    "8": "#A21942",
    "9": "#FD6925",
    "10": "#DD1367",
    "11": "#FD9D24",
    "12": "#BF8B2E",
    "13": "#3F7E44",
    "14": "#0A97D9",
    "15": "#56C02B",
    "16": "#00689D",
    "17": "#19486A",
};

function getSdgColor(code: string): string {
    const num = code.replace(/\D/g, "");
    return SDG_COLORS[num] || "#1E293B";
}

export default function GuestSdgsPage() {
    const router = useRouter();
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

    const handleCardClick = (sdgId: number) => {
        router.push(`/jelajahirepository?sdgId=${sdgId}`);
    };

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
        <main className="min-h-[calc(100vh-72px)] bg-slate-50">
            {/* ── Hero Section ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#132D52] to-[#1a3a66] py-14 sm:py-16">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        SDGs pada Repository
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
                        Lihat bagaimana Tugas Akhir dan Artikel Jurnal di repository ini berkontribusi 
                        pada Sustainable Development Goals (SDGs). Klik pada card untuk menjelajahi karya terkait!
                    </p>

                    {/* Stats pills */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm border border-white/10">
                            <span className="h-2 w-2 rounded-full bg-blue-400" />
                            <span className="text-sm font-semibold text-white">{totalTA}</span>
                            <span className="text-xs text-slate-300">Tugas Akhir</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm border border-white/10">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-sm font-semibold text-white">{totalArtikel}</span>
                            <span className="text-xs text-slate-300">Artikel Jurnal</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Section Header ── */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Informasi SDGs
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Klik pada salah satu card SDG di bawah untuk melihat informasi lebih lanjut
                    </p>
                </div>

                <div className="flex justify-center mb-6">
                    <img src="/images/E_SDG_logo_UN_emblem_horizontal_trans_WEB.png" alt="Logo SDGs Horizontal" className="w-full max-w-2xl h-auto" />
                </div>

                {sdgs.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-slate-400">Belum ada data SDGs.</p>
                    </div>
                ) : (
                    /* ── SDGs Grid Cards ── */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                        {sdgs.map((sdg) => {
                            const goalNum = sdg.code.replace(/\D/g, "");
                            const color = getSdgColor(sdg.code);

                            return (
                                <div
                                    key={sdg.id}
                                    onClick={() => handleCardClick(sdg.id)}
                                    className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl cursor-pointer"
                                >
                                    

                                    

                                    {/* Center: Image logo (if uploaded by admin) OR Fallback Title */}
                                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                                        {sdg.imageUrl ? (
                                            <img
                                                src={sdg.imageUrl}
                                                alt={sdg.title}
                                                className="h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-2xl text-center">
                                                <h3
                                                    className="line-clamp-3 px-2 text-xs font-black uppercase leading-tight"
                                                    style={{ color: color }}
                                                >
                                                    {sdg.title}
                                                </h3>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Radar Chart Distribution Section ── */}
                <section className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
            </div>
        </main>
    );
}
