"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
        <div className="min-h-screen bg-[#E8F5E9]">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                 <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black leading-tight pb-6">
                    Statistic Dosen Jurusan Teknik Otomotif UNP
                </h2>               

                    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs w-full">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                                        <Users className="h-4 w-4" />
                                    </span>
                                    <h3 className="text-lg font-extrabold text-slate-900">
                                        Rekapitulasi Beban Akademik
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

                        <p className="text-xs text-slate-500 pb-2" >
                            Menampilkan {(page - 1) * PER_PAGE + 1} -{" "}
                            {Math.min(page * PER_PAGE, filteredDosens.length)} dari {filteredDosens.length} dosen
                        </p>
                       

                        {/* ── Konten Direktori: Table View ── */}
                        {viewMode === "table" && (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-600">
                                            <th className="px-4 py-3">No</th>
                                            <th className="px-4 py-3">Nama Dosen</th>
                                            <th className="px-3 py-3 text-center">Pembimbing 1</th>
                                            <th className="px-3 py-3 text-center">Pembimbing 2</th>
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

        </div>
    );
}

