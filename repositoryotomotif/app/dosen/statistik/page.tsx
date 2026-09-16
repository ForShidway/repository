"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    BarChart3,
    TrendingUp,
    Globe,
    Users,
    Activity,
    ShieldCheck,
    GraduationCap,
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    SlidersHorizontal,
    PieChart as PieIcon,
} from "lucide-react";
import Link from "next/link";

// --- Tipe Data ---
type DosenStat = {
    id: number;
    name: string;
    pembimbingUtama: number;
    pembimbingPendamping: number;
    totalTa: number;
    totalBimbingan: number;
    dosenPa: number;
    penguji: number;
    pembimbingPi: number;
    pembimbingPlk: number;
    penulisArtikel: number;
    totalAktivitas: number;
    workloadStatus: "Kapasitas Tersedia" | "Beban Ideal" | "Beban Tinggi";
};

type SDGItem = {
    id: number;
    code: string;
    title: string;
    imageUrl?: string | null;
    countTa: number;
    countArtikel: number;
    total: number;
};

type ProdiItem = {
    id: number;
    name: string;
    degree: string;
    countTa: number;
    countArtikel: number;
    total: number;
};

type TrenItem = {
    tahun: number;
    tugasAkhir: number;
    artikel: number;
    total: number;
};

type DistribusiBeban = {
    label: string;
    count: number;
    tier: string;
};

type DashboardData = {
    summary: {
        totalDosen: number;
        totalTugasAkhir: number;
        totalLaporanPi: number;
        totalLaporanPlk: number;
        totalArtikelJurnal: number;
        totalPengujiTa: number;
        totalBimbinganSemua: number;
        totalAktivitasSemua: number;
        meanBimbingan: number;
        meanAktivitas: number;
        stdDevBimbingan: number;
        fairnessIndex: number;
        dosenAktifCount: number;
    };
    topDosen: DosenStat[];
    dosenList: DosenStat[];
    distribusiBeban: DistribusiBeban[];
    sdgsList: SDGItem[];
    prodiList: ProdiItem[];
    trenTahunan: TrenItem[];
};

// Warna Resmi 17 SDGs PBB
const SDG_PALETTE: Record<string, { bg: string; text: string; label: string }> = {
    "1": { bg: "#E5243B", text: "#FFFFFF", label: "Tanpa Kemiskinan" },
    "2": { bg: "#DDA63A", text: "#FFFFFF", label: "Tanpa Kelaparan" },
    "3": { bg: "#4C9F38", text: "#FFFFFF", label: "Kehidupan Sehat & Sejahtera" },
    "4": { bg: "#C5192D", text: "#FFFFFF", label: "Pendidikan Berkualitas" },
    "5": { bg: "#FF3A21", text: "#FFFFFF", label: "Kesetaraan Gender" },
    "6": { bg: "#26BDE2", text: "#FFFFFF", label: "Air Bersih & Sanitasi Layak" },
    "7": { bg: "#FCC30B", text: "#000000", label: "Energi Bersih & Terjangkau" },
    "8": { bg: "#A21942", text: "#FFFFFF", label: "Pekerjaan Layak & Pertumbuhan Ekonomi" },
    "9": { bg: "#FD6925", text: "#FFFFFF", label: "Industri, Inovasi & Infrastruktur" },
    "10": { bg: "#DD1367", text: "#FFFFFF", label: "Berkurangnya Kesenjangan" },
    "11": { bg: "#FD9D24", text: "#FFFFFF", label: "Kota & Permukiman Berkelanjutan" },
    "12": { bg: "#BF8B2E", text: "#FFFFFF", label: "Konsumsi & Produksi Bertanggung Jawab" },
    "13": { bg: "#3F7E44", text: "#FFFFFF", label: "Penanganan Perubahan Iklim" },
    "14": { bg: "#0A97D9", text: "#FFFFFF", label: "Ekosistem Lautan" },
    "15": { bg: "#56C02B", text: "#FFFFFF", label: "Ekosistem Daratan" },
    "16": { bg: "#00689D", text: "#FFFFFF", label: "Perdamaian, Keadilan & Kelembagaan Kuat" },
    "17": { bg: "#19486A", text: "#FFFFFF", label: "Kemitraan untuk Mencapai Tujuan" },
};

function getSdgMeta(code: string) {
    const num = code.replace(/\D/g, "");
    return SDG_PALETTE[num] || { bg: "#0D9488", text: "#FFFFFF", label: "SDG Terintegrasi" };
}

const PRODI_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#10B981"];

function CustomChartTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs text-white shadow-xl backdrop-blur-md">
            <p className="font-bold border-b border-slate-700 pb-1 text-teal-300">{label}</p>
            <div className="mt-1.5 space-y-1">
                {payload.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                            {entry.name}:
                        </span>
                        <span className="font-bold text-white">{entry.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DosenStatistikPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await fetch("/api/dosen/dashboard");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Gagal mengambil data statistik");
                setData(json);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Top Bar */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-xl shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dosen"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                        title="Kembali ke Dashboard Utama"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                            Grafik & Analisis Data Dosen
                        </h1>
                        <p className="text-[11px] text-slate-500 font-medium">
                            Visualisasi persebaran beban, korelasi SDGs, dan distribusi program studi
                        </p>
                    </div>
                </div>

                <Link
                    href="/dosen"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700 shadow-xs transition"
                >
                    <span>Ke Dashboard Terpadu</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600 mb-3" />
                        <p className="text-sm font-semibold text-slate-700">Mempersiapkan Visualisasi Analitik...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="text-sm font-bold text-red-600">{error}</p>
                    </div>
                )}

                {!loading && data && (
                    <>
                        {/* ── Ringkasan Indikator Sains Data ── */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-2">
                                    <span className="text-xs font-semibold">Indeks Pemerataan Beban</span>
                                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                                </div>
                                <p className="text-3xl font-black text-slate-900">{data.summary.fairnessIndex}%</p>
                                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                                    Gini Balance Coefficient
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-2">
                                    <span className="text-xs font-semibold">Rata-rata Bimbingan</span>
                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-3xl font-black text-slate-900">{data.summary.meanBimbingan}</p>
                                <p className="text-[11px] text-slate-500 font-medium mt-1">
                                    Mahasiswa per Dosen (Mean)
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-2">
                                    <span className="text-xs font-semibold">Dispersi Beban (Std Dev)</span>
                                    <Activity className="h-4 w-4 text-purple-600" />
                                </div>
                                <p className="text-3xl font-black text-slate-900">± {data.summary.stdDevBimbingan}</p>
                                <p className="text-[11px] text-slate-500 font-medium mt-1">
                                    Variasi Beban antar Dosen
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-2">
                                    <span className="text-xs font-semibold">Total Kontribusi Repository</span>
                                    <TrendingUp className="h-4 w-4 text-amber-600" />
                                </div>
                                <p className="text-3xl font-black text-slate-900">{data.summary.totalAktivitasSemua}</p>
                                <p className="text-[11px] text-amber-600 font-medium mt-1">
                                    TA, Sidang, PI, PLK, Jurnal
                                </p>
                            </div>
                        </div>

                        {/* ── Distribusi Bimbingan & Program Studi ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Stacked Chart Top Dosen */}
                            <div className="lg:col-span-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                            Persebaran Bimbingan Dosen Teratas
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Komparasi Bimbingan Utama (Bimb 1), Pendamping (Bimb 2), Penguji, dan Praktik Industri
                                        </p>
                                    </div>
                                </div>

                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={data.topDosen.map((d) => ({
                                                name: d.name.length > 18 ? d.name.slice(0, 16) + "..." : d.name,
                                                fullName: d.name,
                                                "Bimbingan 1": d.pembimbingUtama,
                                                "Bimbingan 2": d.pembimbingPendamping,
                                                Penguji: d.penguji,
                                                PI: d.pembimbingPi,
                                            }))}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                                        >
                                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} interval={0} angle={-15} textAnchor="end" />
                                            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                                            <Tooltip content={<CustomChartTooltip />} />
                                            <Bar dataKey="Bimbingan 1" stackId="a" fill="#0D9488" />
                                            <Bar dataKey="Bimbingan 2" stackId="a" fill="#3B82F6" />
                                            <Bar dataKey="Penguji" stackId="a" fill="#A855F7" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Distribusi Program Studi */}
                            <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 mb-1">
                                        Distribusi Program Studi
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Sebaran Tugas Akhir dan Jurnal per jenjang program studi:
                                    </p>

                                    <div className="space-y-3">
                                        {data.prodiList.map((p, idx) => (
                                            <div key={p.id} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                                                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                                    <span>{p.name} ({p.degree})</span>
                                                    <span className="text-teal-700">{p.total} Karya</span>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>Tugas Akhir: {p.countTa}</span>
                                                    <span>Jurnal: {p.countArtikel}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                    <Link
                                        href="/dosen"
                                        className="text-xs font-bold text-teal-600 hover:text-teal-800 transition"
                                    >
                                        Buka Direktori Lengkap Semua Dosen ➔
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ── Matriks Kontribusi SDGs Resmi PBB ── */}
                        {data.sdgsList && data.sdgsList.length > 0 && (
                            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                                <Globe className="h-4 w-4" />
                                            </span>
                                            <h3 className="text-lg font-extrabold text-slate-900">
                                                Matriks Kontribusi Sustainable Development Goals (SDGs)
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                                            Pemetaan karya Tugas Akhir dan Artikel Jurnal civitas akademika Jurusan Teknik Otomotif ke 17 Tujuan Pembangunan Berkelanjutan PBB.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {data.sdgsList.map((sdg) => {
                                        const meta = getSdgMeta(sdg.code);
                                        return (
                                            <div
                                                key={sdg.id}
                                                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                                            >
                                                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: meta.bg }} />
                                                <div className="flex items-start gap-2.5 mb-3">
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-xs"
                                                        style={{ backgroundColor: meta.bg, color: meta.text }}
                                                    >
                                                        {sdg.code.replace(/\D/g, "") || sdg.code}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            {sdg.code}
                                                        </p>
                                                        <p className="text-xs font-extrabold text-slate-800 line-clamp-1">
                                                            {sdg.title}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs bg-slate-50 rounded-xl p-2 font-semibold">
                                                    <span className="text-slate-500">TA: {sdg.countTa}</span>
                                                    <span className="text-slate-500">Jurnal: {sdg.countArtikel}</span>
                                                    <span className="text-teal-700 font-bold">Total: {sdg.total}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

