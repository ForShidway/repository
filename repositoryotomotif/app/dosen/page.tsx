"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "recharts";
import {
    GraduationCap,
    BookOpen,
    Users,
    FileText,
    Search,
    BarChart3,
    TrendingUp,
    Sparkles,
    Activity,
    Calendar,
    ChevronRight,
    CheckCircle2,
    LayoutGrid,
    ListFilter,
    Briefcase,
    ShieldCheck,
    Globe,
} from "lucide-react";

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

// Custom Tooltip Recharts
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 text-xs text-white shadow-xl backdrop-blur-md">
            <p className="font-bold border-b border-slate-700/80 pb-1.5 text-teal-300">{label}</p>
            <div className="mt-2 space-y-1">
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

const PER_PAGE = 8;

export default function DosenDashboardPage() {
    const router = useRouter();

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // State Kontrol Navigasi & Filter
    const [activeTab, setActiveTab] = useState<"overview" | "workload" | "sdgs" | "directory">("overview");
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "Kapasitas Tersedia" | "Beban Ideal" | "Beban Tinggi">("all");
    const [sortBy, setSortBy] = useState<"totalAktivitas" | "totalBimbingan" | "penguji" | "pembimbingPi" | "penulisArtikel" | "name">("totalAktivitas");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                setLoading(true);
                setError("");
                const response = await fetch("/api/dosen/dashboard");
                const json = await response.json();
                if (!response.ok) throw new Error(json.message || "Gagal memuat data dashboard");
                setData(json);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data");
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    // Filter & Sorting Dosen untuk Direktori
    const filteredDosens = useMemo(() => {
        if (!data?.dosenList) return [];
        let list = [...data.dosenList];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((d) => d.name.toLowerCase().includes(q));
        }

        if (filterStatus !== "all") {
            list = list.filter((d) => d.workloadStatus === filterStatus);
        }

        list.sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            }
            return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
        });

        return list;
    }, [data?.dosenList, search, filterStatus, sortBy]);

    const totalPages = Math.ceil(filteredDosens.length / PER_PAGE);
    const pagedDosens = filteredDosens.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // Navigasi ke Halaman Detail Dosen (app/dosen/[id]/page.tsx TETAP UTUH)
    const handleDetailClick = (dosenId: number) => {
        router.push(`/dosen/${dosenId}`);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* ── Banner Utama & Quick Insight ── */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl shadow-teal-950/15 mb-8">
                    <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="max-w-2xl">
                            
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                                Ringkasan Akademik & Manajemen Beban Dosen
                            </h2>
                        </div>
                    </div>
                </section>

                {/* ── Navigation Tabs ── */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab("overview")}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                activeTab === "overview"
                                    ? "bg-white text-teal-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Ringkasan Eksekutif & KPI
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("workload")}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                activeTab === "workload"
                                    ? "bg-white text-teal-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <BarChart3 className="h-4 w-4" />
                            Persebaran Beban Dosen
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("sdgs")}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                activeTab === "sdgs"
                                    ? "bg-white text-teal-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <Globe className="h-4 w-4 text-emerald-600" />
                            Matriks SDGs & Publikasi
                        </button>
                        
                    </div>

                </div>

                {/* ── Loading State ── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600 mb-3" />
                        <p className="text-sm font-semibold text-slate-700">Mengkonsolidasi Data Repository & Analitik...</p>
                        <p className="text-xs text-slate-400 mt-1">Menggabungkan data tugas akhir, bimbingan, pengujian, dan SDGs</p>
                    </div>
                )}

                {/* ── Error State ── */}
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="text-sm font-bold text-red-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {!loading && data && (
                    <div className="space-y-8">
                        {/* ========================================================================= */}
                        {/* TAB 1: OVERVIEW & RINGKASAN EKSEKUTIF                                     */}
                        {/* ========================================================================= */}
                        {(activeTab === "overview" || activeTab === "workload") && (
                            <>
                                {/* ── 6 Kartu Metrik Repository Utama ── */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-teal-300 transition group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition">
                                                <Users className="h-4 w-4" />
                                            </span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                Fakultas
                                            </span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">{data.summary.totalDosen}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Total Dosen</p>
                                        <p className="text-[11px] text-teal-600 font-medium mt-1">
                                            {data.summary.dosenAktifCount} dosen aktif
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-blue-300 transition group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                                                <GraduationCap className="h-4 w-4" />
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                Karya TA
                                            </span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">{data.summary.totalTugasAkhir}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Tugas Akhir</p>
                                        <p className="text-[11px] text-blue-600 font-medium mt-1">
                                            {data.summary.totalBimbinganSemua} slot bimbingan
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-indigo-300 transition group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                                                <Briefcase className="h-4 w-4" />
                                            </span>
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                Industri
                                            </span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">{data.summary.totalLaporanPi}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Laporan PI</p>
                                        <p className="text-[11px] text-indigo-600 font-medium mt-1">
                                            Praktik Industri
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-pink-300 transition group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition">
                                                <FileText className="h-4 w-4" />
                                            </span>
                                            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                                                Lapangan
                                            </span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">{data.summary.totalLaporanPlk}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Laporan PLK</p>
                                        <p className="text-[11px] text-pink-600 font-medium mt-1">
                                            Pengalaman Kerja
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-amber-300 transition group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                                                <BookOpen className="h-4 w-4" />
                                            </span>
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                                Riset
                                            </span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">{data.summary.totalArtikelJurnal}</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Artikel Jurnal</p>
                                        <p className="text-[11px] text-amber-600 font-medium mt-1">
                                            Publikasi Ilmiah
                                        </p>
                                    </div>
                                </div>

                                {/* ── Visualisasi Bar Chart & Histogram Beban ── */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Grafik Top Dosen & Distribusi Peran */}
                                    <div className="lg:col-span-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                                                    <h3 className="text-base font-bold text-slate-900">
                                                        Persebaran Bimbingan Dosen Teratas
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-sm bg-teal-600" /> Bimb. 1
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Bimb. 2
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="h-2.5 w-2.5 rounded-sm bg-purple-500" /> Penguji
                                                </span>
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
                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{ fontSize: 11, fill: "#64748B" }}
                                                        interval={0}
                                                        angle={-15}
                                                        textAnchor="end"
                                                    />
                                                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                                                    <Tooltip content={<ChartTooltip />} />
                                                    <Bar dataKey="Bimbingan 1" stackId="a" fill="#0D9488" radius={[0, 0, 0, 0]} />
                                                    <Bar dataKey="Bimbingan 2" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                                                    <Bar dataKey="Penguji" stackId="a" fill="#A855F7" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                                            
                                            <span className="text-teal-700 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab("directory")}>
                                                Lihat seluruh {data.summary.totalDosen} dosen ➔
                                            </span>
                                        </div>
                                    </div>

                                    {/* Data Science: Histogram Distribusi Beban Dosen */}
                                    <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                                        <Activity className="h-4 w-4" />
                                                    </span>
                                                    <h3 className="text-base font-bold text-slate-900">
                                                        Sebaran Beban Bimbingan
                                                    </h3>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    Histogram
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-5">
                                                Kategorisasi dosen berdasarkan jumlah bimbingan aktif untuk pemerataan beban:
                                            </p>

                                            <div className="space-y-3.5">
                                                {data.distribusiBeban.map((item, idx) => {
                                                    const pct = data.summary.totalDosen
                                                        ? Math.round((item.count / data.summary.totalDosen) * 100)
                                                        : 0;
                                                    const colors = [
                                                        "bg-slate-400",
                                                        "bg-teal-500",
                                                        "bg-emerald-500",
                                                        "bg-amber-500",
                                                        "bg-red-500",
                                                    ];
                                                    return (
                                                        <div key={idx} className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                                <span className="text-slate-700">{item.label}</span>
                                                                <span className="text-slate-500">
                                                                    <strong className="text-slate-900">{item.count}</strong> dosen ({pct}%)
                                                                </span>
                                                            </div>
                                                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-700 ${colors[idx % colors.length]}`}
                                                                    style={{ width: `${Math.max(5, pct)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Tren 5 Tahun Aktivitas Repository ── */}
                                {data.trenTahunan && data.trenTahunan.length > 0 && (
                                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-teal-600" />
                                                    Tren Publikasi Tahun Terakhir
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Perkembangan Tugas Akhir dan artikel jurnal yang dibimbing oleh dosen
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-semibold">
                                                <span className="flex items-center gap-1.5 text-slate-600">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Tugas Akhir
                                                </span>
                                                <span className="flex items-center gap-1.5 text-slate-600">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Artikel Jurnal
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-60 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart
                                                    data={data.trenTahunan}
                                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="colorTa" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorArt" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#64748B" }} />
                                                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                                                    <Tooltip content={<ChartTooltip />} />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="tugasAkhir"
                                                        name="Tugas Akhir"
                                                        stroke="#0D9488"
                                                        strokeWidth={2.5}
                                                        fillOpacity={1}
                                                        fill="url(#colorTa)"
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="artikel"
                                                        name="Artikel Jurnal"
                                                        stroke="#F59E0B"
                                                        strokeWidth={2.5}
                                                        fillOpacity={1}
                                                        fill="url(#colorArt)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ========================================================================= */}
                        {/* TAB 2: MATRIKS SDGS & KONTRIBUSI RISET                                   */}
                        {/* ========================================================================= */}
                        {(activeTab === "sdgs" || activeTab === "overview") && data.sdgsList && data.sdgsList.length > 0 && (
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
                                    </div>
                                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-xl shrink-0">
                                        Total {data.sdgsList.reduce((acc, s) => acc + s.total, 0)} Karya Terkait SDGs
                                    </span>
                                </div>

                                {/* Grid Kartu SDGs Resmi PBB */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {data.sdgsList.map((sdg) => {
                                        const meta = getSdgMeta(sdg.code);
                                        const hasKarya = sdg.total > 0;

                                        return (
                                            <div
                                                key={sdg.id}
                                                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                                            >
                                                {/* Visual Gambar Resmi SDG & Judul */}
                                                <div className="flex items-center gap-3.5">
                                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/60 shadow-xs flex items-center justify-center">
                                                        {sdg.imageUrl ? (
                                                            <img
                                                                src={sdg.imageUrl}
                                                                alt={sdg.title}
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="flex h-full w-full items-center justify-center p-1.5 text-center text-[10px] font-bold text-white leading-tight"
                                                                style={{ backgroundColor: meta.bg }}
                                                            >
                                                                {sdg.title}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                                            {sdg.title}
                                                        </h4>
                                                        <div className="mt-1 flex items-center gap-1.5">
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                hasKarya ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-slate-100 text-slate-400"
                                                            }`}>
                                                                {sdg.total} Total Karya
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Rincian Karya Terdaftar */}
                                                <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-600 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                        TA: <strong className="text-slate-800">{sdg.countTa}</strong>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                                        Jurnal: <strong className="text-slate-800">{sdg.countArtikel}</strong>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ========================================================================= */}
                        {/* TAB 3 & 4: DIREKTORI DOSEN & REKAPITULASI                                */}
                        {/* ========================================================================= */}
                        
                    </div>
                )}
            </div>
        </div>
    );
}