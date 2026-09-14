"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    FileText,
    GraduationCap,
    Users,
    Building2,
    Globe2,
    BookOpen,
    Briefcase,
    Sparkles,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from "lucide-react";
import StatistikDashboard from "@/components/admin/StatistikDashboard";
import SdgRadarChart from "@/components/admin/SdgRadarChart";

type Summary = {
    totalTugasAkhir: number;
    totalDosen: number;
    totalRuangan: number;
    totalSDGs: number;
    totalUser: number;
    totalProgramStudy: number;
    totalMahasiswa: number;
    totalArtikelJurnal: number;
    totalLaporanPi: number;
    totalLaporanPlk: number;
};

type TugasPerTahun = {
    tahun: number;
    jumlah: number;
};

type TahunStat = {
    tahun: number;
    jumlah: number;
};

type ProgramStudyStat = {
    id: number;
    name: string;
    degree: string;
    jumlah: number;
};

type SdgStat = {
    id: number;
    code: string;
    title: string;
    jumlah: number;
};

type Mahasiswa = {
    id: number;
    name: string;
    nim: string;
    urutan: number;
};

type TugasAkhirTerbaru = {
    id: number;
    judul: string;
    tahunMasuk: number;
    programStudy: {
        name: string;
        degree: string;
    } | null;
    pembimbing: {
        name: string;
    } | null;
    mahasiswa: Mahasiswa[];
};

type ArtikelJurnalTerbaru = {
    id: number;
    judul: string;
    tahun: number;
    programStudy: {
        name: string;
        degree: string;
    } | null;
    mahasiswa: Mahasiswa[];
};

type Aktivitas = {
    id: number;
    judul: string;
    mahasiswa: Mahasiswa[];
    fileName: string | null;
    createdAt: string;
};

type DashboardData = {
    summary: Summary;
    tugasPerTahun: TugasPerTahun[];
    artikelPerTahun: TahunStat[];
    laporanPiPerTahun: TahunStat[];
    laporanPlkPerTahun: TahunStat[];
    distribusiProgramStudy: ProgramStudyStat[];
    distribusiArtikelProgramStudy: ProgramStudyStat[];
    distribusiSdgs: SdgStat[];
    tugasAkhirTerbaru: TugasAkhirTerbaru[];
    artikelJurnalTerbaru: ArtikelJurnalTerbaru[];
    aktivitasTerbaru: Aktivitas[];
};

const DONUT_COLORS = [
    "#2563EB", // Blue
    "#10B981", // Emerald
    "#8B5CF6", // Violet
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#06B6D4", // Cyan
];

function CustomPieTooltip({
    active,
    payload,
    total,
    unit = "Item",
}: {
    active?: boolean;
    payload?: Array<{ payload: { name?: string; degree?: string; tahun?: number; jumlah: number } }>;
    total: number;
    unit?: string;
}) {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const percentage = total > 0 ? Math.round((data.jumlah / total) * 100) : 0;
    const label = data.name || (data.tahun ? `Tahun ${data.tahun}` : "Program");

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md p-2.5 text-xs text-white shadow-2xl space-y-0.5 z-[1000] pointer-events-none min-w-[130px]">
            <p className="font-bold text-white leading-tight">{label}</p>
            {data.degree && <p className="text-[10px] text-slate-300">{data.degree}</p>}
            <p className="text-xs font-extrabold text-blue-400">
                {data.jumlah} {unit} <span className="text-[10px] font-normal text-slate-300">({percentage}%)</span>
            </p>
        </div>
    );
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [articlePage, setArticlePage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const response = await fetch("/api/admin/statistics");
                const contentType = response.headers.get("content-type") || "";

                let result: (DashboardData & { message?: string }) | null = null;
                if (contentType.includes("application/json")) {
                    result = await response.json();
                } else {
                    const text = await response.text();
                    throw new Error(
                        text.includes("<")
                            ? "Endpoint statistik tidak ditemukan."
                            : text || "Gagal mengambil data dashboard"
                    );
                }

                if (!response.ok) {
                    throw new Error(result?.message || "Gagal mengambil data dashboard");
                }
                setData(result);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6 lg:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-56 rounded-lg bg-slate-200" />
                        <div className="h-4 w-80 rounded-lg bg-slate-200" />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                <div key={item} className="h-24 rounded-xl bg-white shadow-xs" />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="min-h-screen bg-slate-50 p-6 lg:p-8">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                        <h2 className="font-semibold text-red-700 text-sm">Gagal memuat dashboard admin</h2>
                        <p className="mt-1 text-xs text-red-600">{error}</p>
                    </div>
                </div>
            </main>
        );
    }

    const formatMahasiswa = (mahasiswa: Array<{ name: string; nim?: string | null }> = []) => {
        if (!mahasiswa.length) return "-";
        return mahasiswa.map((m) => `${m.name}${m.nim ? ` (${m.nim})` : ""}`).join(", ");
    };

    const renderDonutSection = (
        title: string,
        dataList: Array<{ id?: number | string; name?: string; degree?: string; tahun?: number; jumlah: number }>,
        total: number,
        unitLabel: string
    ) => (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h3>
                </div>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 shrink-0">
                    Total: {total}
                </span>
            </div>

            {dataList.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center p-3">
                    <p className="text-[11px] font-medium text-slate-400">Belum ada data tersedia.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative h-36 w-full max-w-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataList}
                                    dataKey="jumlah"
                                    nameKey={dataList[0]?.name ? "name" : "tahun"}
                                    innerRadius={38}
                                    outerRadius={58}
                                    paddingAngle={dataList.length > 1 ? 2 : 0}
                                >
                                    {dataList.map((entry, index) => (
                                        <Cell
                                            key={entry.id || entry.tahun || index}
                                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                                            stroke="#ffffff"
                                            strokeWidth={1.5}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
                                    content={<CustomPieTooltip total={total} unit={unitLabel} />}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                            <p className="text-base font-black text-slate-900 leading-none">{total}</p>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{unitLabel}</p>
                        </div>
                    </div>

                    <div className="w-full space-y-1.5">
                        {dataList.map((item, index) => {
                            const percentage = total > 0 ? Math.round((item.jumlah / total) * 100) : 0;
                            const itemTitle = item.name || `Tahun ${item.tahun}`;

                            return (
                                <div key={item.id || item.tahun || index} className="flex items-center justify-between text-[11px]">
                                    <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-1">
                                        <span
                                            className="h-2 w-2 shrink-0 rounded-full"
                                            style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                                        />
                                        <span className="min-w-0 truncate font-medium text-slate-700" title={itemTitle}>
                                            {itemTitle}
                                        </span>
                                    </div>
                                    <span className="shrink-0 font-bold text-slate-900">
                                        {item.jumlah} <span className="text-[10px] font-normal text-slate-400">({percentage}%)</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );

    return (
        <main className="min-h-screen bg-slate-50/60 px-4 py-6 sm:px-6 lg:px-8 pb-12">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header Admin */}
                <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                            <Sparkles className="w-3 h-3 text-blue-600" /> Admin Executive Dashboard
                        </span>
                        <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Beranda Administrator
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Pusat analisis data & pengelolaan repository Jurusan Teknik Otomotif UNP.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs shrink-0 text-xs font-semibold text-slate-700">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Tahun Akademik {new Date().getFullYear()}</span>
                    </div>
                </section>

                {/* 8 Compact Summary Stat Cards */}
                <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    <StatCard
                        icon={<FileText className="h-4 h-4" />}
                        label="Tugas Akhir"
                        value={data.summary.totalTugasAkhir}
                        description="Total terdaftar"
                        iconClass="bg-blue-50 text-blue-600"
                        accent="border-l-4 border-blue-600"
                    />
                    <StatCard
                        icon={<GraduationCap className="h-4 h-4" />}
                        label="Dosen"
                        value={data.summary.totalDosen}
                        description="Dosen Aktif"
                        iconClass="bg-emerald-50 text-emerald-600"
                        accent="border-l-4 border-emerald-600"
                    />
                    <StatCard
                        icon={<Users className="h-4 h-4" />}
                        label="Mahasiswa"
                        value={data.summary.totalMahasiswa}
                        description="Memiliki TA"
                        iconClass="bg-violet-50 text-violet-600"
                        accent="border-l-4 border-violet-600"
                    />
                    <StatCard
                        icon={<Building2 className="h-4 h-4" />}
                        label="Ruangan"
                        value={data.summary.totalRuangan}
                        description="Ruangan Terdaftar"
                        iconClass="bg-amber-50 text-amber-600"
                        accent="border-l-4 border-amber-600"
                    />
                    <StatCard
                        icon={<Globe2 className="h-4 h-4" />}
                        label="SDGs"
                        value={data.summary.totalSDGs}
                        description="SDGs Aktif"
                        iconClass="bg-cyan-50 text-cyan-600"
                        accent="border-l-4 border-cyan-600"
                    />
                    <StatCard
                        icon={<BookOpen className="h-4 h-4" />}
                        label="Artikel Jurnal"
                        value={data.summary.totalArtikelJurnal}
                        description="Artikel Tersedia"
                        iconClass="bg-indigo-50 text-indigo-600"
                        accent="border-l-4 border-indigo-600"
                    />
                    <StatCard
                        icon={<Briefcase className="h-4 h-4" />}
                        label="Laporan PI"
                        value={data.summary.totalLaporanPi}
                        description="Laporan PI"
                        iconClass="bg-teal-50 text-teal-600"
                        accent="border-l-4 border-teal-600"
                    />
                    <StatCard
                        icon={<Users className="h-4 h-4" />}
                        label="Laporan PLK"
                        value={data.summary.totalLaporanPlk}
                        description="Laporan PLK"
                        iconClass="bg-rose-50 text-rose-600"
                        accent="border-l-4 border-rose-600"
                    />
                </section>

                {/* Dashboard Combined Bar Analytics Component (With Recharts) */}
                <StatistikDashboard
                    programStudyOptions={data.distribusiProgramStudy.map((ps) => ({
                        id: ps.id,
                        name: ps.name,
                        degree: ps.degree,
                    }))}
                />

                {/* 4 Donut Analytics Charts Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {renderDonutSection(
                        "Distribusi Tugas Akhir",
                        data.distribusiProgramStudy.slice(0, 5),
                        data.summary.totalTugasAkhir,
                        "TA"
                    )}
                    {renderDonutSection(
                        "Distribusi Artikel Jurnal",
                        data.distribusiArtikelProgramStudy.slice(0, 5),
                        data.summary.totalArtikelJurnal,
                        "Artikel"
                    )}
                    {renderDonutSection(
                        "Distribusi Laporan PI",
                        data.laporanPiPerTahun
                            .filter((item) => item.jumlah > 0)
                            .map((item) => ({
                                id: item.tahun,
                                name: `Tahun ${item.tahun}`,
                                degree: "Tahun Mulai",
                                jumlah: item.jumlah,
                            })),
                        data.summary.totalLaporanPi,
                        "PI"
                    )}
                    {renderDonutSection(
                        "Distribusi Laporan PLK",
                        data.laporanPlkPerTahun
                            .filter((item) => item.jumlah > 0)
                            .map((item) => ({
                                id: item.tahun,
                                name: `Tahun ${item.tahun}`,
                                degree: "Tahun Mulai",
                                jumlah: item.jumlah,
                            })),
                        data.summary.totalLaporanPlk,
                        "PLK"
                    )}
                </div>

                {/* SDGs Radar Chart */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">Beban SDGs pada Tugas Akhir</h2>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                        Sebaran jumlah Tugas Akhir berdasarkan Sustainable Development Goals.
                    </p>

                    <div className="mt-4">
                        <SdgRadarChart data={data.distribusiSdgs} />
                    </div>
                </section>

                {/* Table: Tugas Akhir Terbaru */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 p-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Tugas Akhir Terbaru</h2>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                {data.tugasAkhirTerbaru.length} Tugas Akhir terbaru terdaftar
                            </p>
                        </div>
                        <Link
                            href="/admin/tugas-akhirs"
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                            Lihat Semua <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="px-4 py-2.5 w-12">No.</th>
                                    <th className="px-4 py-2.5">Judul Tugas Akhir</th>
                                    <th className="px-4 py-2.5">Mahasiswa</th>
                                    <th className="px-4 py-2.5">Tahun</th>
                                    <th className="px-4 py-2.5">Program Studi</th>
                                    <th className="px-4 py-2.5">Pembimbing</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {data.tugasAkhirTerbaru
                                    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
                                    .map((ta, index) => (
                                        <tr key={ta.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-2.5 font-semibold text-slate-400">
                                                {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="max-w-[280px] px-4 py-2.5">
                                                <p className="line-clamp-2 font-semibold text-slate-800 leading-snug">
                                                    {ta.judul}
                                                </p>
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-700 font-medium">
                                                {formatMahasiswa(ta.mahasiswa)}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700 text-[11px]">
                                                    {ta.tahunMasuk}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {ta.programStudy ? (
                                                    <div>
                                                        <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                                                            {ta.programStudy.degree}
                                                        </span>
                                                        <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                                                            {ta.programStudy.name}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[10px]">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-700 font-medium">
                                                {ta.pembimbing?.name || "-"}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {data.tugasAkhirTerbaru.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs">
                            <p className="text-[11px] text-slate-500">
                                Menampilkan Halaman <span className="font-bold text-slate-800">{page}</span> dari{" "}
                                <span className="font-bold text-slate-800">
                                    {Math.ceil(data.tugasAkhirTerbaru.length / ITEMS_PER_PAGE)}
                                </span>
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(Math.ceil(data.tugasAkhirTerbaru.length / ITEMS_PER_PAGE), p + 1)
                                        )
                                    }
                                    disabled={page === Math.ceil(data.tugasAkhirTerbaru.length / ITEMS_PER_PAGE)}
                                    className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Table: Artikel Jurnal Terbaru */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 p-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Artikel Jurnal Terbaru</h2>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                {data.artikelJurnalTerbaru.length} Artikel Jurnal terbaru terdaftar
                            </p>
                        </div>
                        <Link
                            href="/admin/artikel-jurnal"
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                            Lihat Semua <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="px-4 py-2.5 w-12">No.</th>
                                    <th className="px-4 py-2.5">Judul Artikel</th>
                                    <th className="px-4 py-2.5">Penulis / Mahasiswa</th>
                                    <th className="px-4 py-2.5">Tahun</th>
                                    <th className="px-4 py-2.5">Program Studi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {data.artikelJurnalTerbaru
                                    .slice((articlePage - 1) * ITEMS_PER_PAGE, articlePage * ITEMS_PER_PAGE)
                                    .map((aj, index) => (
                                        <tr key={aj.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-2.5 font-semibold text-slate-400">
                                                {(articlePage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="max-w-[300px] px-4 py-2.5">
                                                <p className="line-clamp-2 font-semibold text-slate-800 leading-snug">
                                                    {aj.judul}
                                                </p>
                                            </td>
                                            <td className="px-4 py-2.5 text-slate-700 font-medium">
                                                {formatMahasiswa(aj.mahasiswa)}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700 text-[11px]">
                                                    {aj.tahun}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {aj.programStudy ? (
                                                    <div>
                                                        <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                                                            {aj.programStudy.degree}
                                                        </span>
                                                        <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                                                            {aj.programStudy.name}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[10px]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {data.artikelJurnalTerbaru.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs">
                            <p className="text-[11px] text-slate-500">
                                Menampilkan Halaman <span className="font-bold text-slate-800">{articlePage}</span> dari{" "}
                                <span className="font-bold text-slate-800">
                                    {Math.ceil(data.artikelJurnalTerbaru.length / ITEMS_PER_PAGE)}
                                </span>
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setArticlePage((p) => Math.max(1, p - 1))}
                                    disabled={articlePage === 1}
                                    className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() =>
                                        setArticlePage((p) =>
                                            Math.min(Math.ceil(data.artikelJurnalTerbaru.length / ITEMS_PER_PAGE), p + 1)
                                        )
                                    }
                                    disabled={articlePage === Math.ceil(data.artikelJurnalTerbaru.length / ITEMS_PER_PAGE)}
                                    className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function StatCard({
    icon,
    label,
    value,
    description,
    iconClass,
    accent = "",
}: {
    icon: ReactNode;
    label: string;
    value: number;
    description: string;
    iconClass: string;
    accent?: string;
}) {
    return (
        <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:shadow-md ${accent}`}>
            <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-bold ${iconClass}`}>
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
                    <p className="text-xs font-bold text-slate-700 leading-tight mt-0.5 truncate">{label}</p>
                </div>
            </div>
        </div>
    );
}
