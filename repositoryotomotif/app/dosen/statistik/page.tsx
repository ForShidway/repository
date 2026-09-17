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
    Search,
    LayoutGrid,
    ListFilter,
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
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "Kapasitas Tersedia" | "Beban Ideal" | "Beban Tinggi">("all");
    const [sortBy, setSortBy] = useState<"totalAktivitas" | "totalBimbingan" | "penguji" | "pembimbingPi" | "penulisArtikel" | "name">("totalAktivitas");
    const [viewMode, setViewMode] = useState<"grid" | "table">("table");
    const [page, setPage] = useState(1);

    const PER_PAGE = 10;

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

    const filteredDosens = useMemo(() => {
        if (!data?.dosenList) return [];

        let list = [...data.dosenList];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((d) => d.name.toLowerCase().includes(q));
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

    const handleDetailClick = (dosenId: number) => {
        router.push(`/dosen/${dosenId}`);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            

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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

                            <div className="rounded-2xl border border-indigo-200/80 bg-white p-5 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-2">
                                    <span className="text-xs font-semibold">Laporan PI</span>
                                    <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
                                </div>
                                <p className="text-3xl font-black text-slate-900">{data.summary.totalLaporanPi}</p>
                                <p className="text-[11px] text-indigo-600 font-medium mt-1">
                                    Total Laporan Praktik Industri
                                </p>
                            </div>

                            <div className="rounded-2xl border border-pink-200/80 bg-white p-5 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-2">
                                    <span className="text-xs font-semibold">Laporan PLK</span>
                                    <PieIcon className="h-4 w-4 text-pink-600" />
                                </div>
                                <p className="text-3xl font-black text-slate-900">{data.summary.totalLaporanPlk}</p>
                                <p className="text-[11px] text-pink-600 font-medium mt-1">
                                    Total Laporan Pelatihan Kependidikan
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
                                            Persebaran Tugas Bimbingan Dosen Teratas
                                        </h3>
                                    
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
                                                PLK: d.pembimbingPlk,
                                            }))}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                                        >
                                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} interval={0} angle={-15} textAnchor="end" />
                                            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                                            <Tooltip content={<CustomChartTooltip />} />
                                            <Bar dataKey="Bimbingan 1" stackId="a" fill="#0D9488" />
                                            <Bar dataKey="Bimbingan 2" stackId="a" fill="#3B82F6" />
                                            <Bar dataKey="Penguji" stackId="a" fill="#A855F7" />
                                            <Bar dataKey="PI" stackId="a" fill="#6366F1" />
                                            <Bar dataKey="PLK" stackId="a" fill="#EC4899" radius={[4, 4, 0, 0]} />
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

                        
                    </>
                    
                )}
            </div>

                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                                            <Users className="h-4 w-4" />
                                        </span>
                                        <h3 className="text-lg font-extrabold text-slate-900">
                                            Direktori Dosen & Rekapitulasi Beban Akademik
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Klik pada salah satu dosen untuk melihat data yang lebih lengkap
                                    </p>
                                </div>

                            </div>

                            {/* ── Toolbar Pencarian & Filter Cerdas ── */}
                            <div className="mb-6 flex flex-col md:flex-row gap-3">
                                {/* Input Cari Nama */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                        placeholder="Cari nama dosen pembimbing / penguji..."
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => {
                                                setSearch("");
                                                setPage(1);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>


                                {/* Urutkan Berdasarkan */}
                                <div className="relative shrink-0">
                                    <select
                                        value={sortBy}
                                        onChange={(e: any) => setSortBy(e.target.value)}
                                        className="w-full md:w-auto rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-500"
                                    >
                                        <option value="totalAktivitas">Urutkan: Total Kontribusi</option>
                                        <option value="totalBimbingan">Urutkan: Bimbingan TA Terbanyak</option>
                                        <option value="penguji">Urutkan: Penguji Sidang Terbanyak</option>
                                        <option value="pembimbingPi">Urutkan: Pembimbing PI</option>
                                        <option value="penulisArtikel">Urutkan: Artikel Jurnal</option>
                                        <option value="name">Urutkan: Abjad Nama (A - Z)</option>
                                    </select>
                                </div>
                            </div>

                           

                            {/* ── Konten Direktori: Table View ── */}
                            {viewMode === "table" && (
                                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
                                                <th className="px-4 py-3">No</th>
                                                <th className="px-4 py-3">Nama Dosen</th>
                                                <th className="px-3 py-3 text-center">Bimb. 1</th>
                                                <th className="px-3 py-3 text-center">Bimb. 2</th>
                                                <th className="px-3 py-3 text-center">Total TA</th>
                                                <th className="px-3 py-3 text-center">Penguji</th>
                                                <th className="px-3 py-3 text-center">PI</th>
                                                <th className="px-3 py-3 text-center">PLK</th>
                                                <th className="px-3 py-3 text-center">Artikel</th>
                                                <th className="px-4 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {pagedDosens.map((dosen, index) => (
                                                <tr
                                                    key={dosen.id}
                                                    onClick={() => handleDetailClick(dosen.id)}
                                                    className="hover:bg-teal-50/40 transition cursor-pointer"
                                                >
                                                     <td className="px-4 py-3.5 font-bold text-slate-900">
                                                        {index+1}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-bold text-slate-900">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="line-clamp-1">{dosen.name}</span>
                                                        </div>
                                                    </td>
                                                   
                                                    <td className="px-3 py-3.5 text-center font-bold text-slate-700">
                                                        {dosen.pembimbingUtama}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-center font-bold text-slate-700">
                                                        {dosen.pembimbingPendamping}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-center font-extrabold text-teal-700">
                                                        {dosen.totalTa}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-center font-bold text-blue-700">
                                                        {dosen.penguji}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-center text-slate-600">
                                                        {dosen.pembimbingPi}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-center text-slate-600">
                                                        {dosen.pembimbingPlk}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-center font-bold text-amber-700">
                                                        {dosen.penulisArtikel}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-right">
                                                        <span className="inline-flex items-center gap-1 font-bold text-teal-600 hover:text-teal-800">
                                                            Detail
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ── Empty State ── */}
                            {filteredDosens.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="font-semibold text-slate-700">Tidak ada dosen yang cocok dengan kriteria pencarian.</p>
                                    <button
                                        onClick={() => {
                                            setSearch("");
                                            setFilterStatus("all");
                                        }}
                                        className="mt-2 text-xs font-bold text-teal-600 hover:underline"
                                    >
                                        Reset Filter Pencarian
                                    </button>
                                </div>
                            )}

                            {/* ── Pagination ── */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <p className="text-xs text-slate-500">
                                        Menampilkan {(page - 1) * PER_PAGE + 1} -{" "}
                                        {Math.min(page * PER_PAGE, filteredDosens.length)} dari {filteredDosens.length} dosen
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                        >
                                            Sebelumnya
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                                                    page === p
                                                        ? "bg-teal-600 text-white shadow-xs"
                                                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                        >
                                            Berikutnya
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

        </div>
    );
}

