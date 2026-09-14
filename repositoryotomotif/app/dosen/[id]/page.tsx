"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts";
import {
    GraduationCap,
    BookOpen,
    Users,
    FileText,
    Search,
    ChevronLeft,
    ChevronRight,
    Award,
    Target,
    BarChart3,
    Calendar,
    Briefcase,
    X,
    Filter,
    Sparkles,
    ArrowLeft,
} from "lucide-react";

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
};

type SDGs = {
    id: number;
    code: string;
    title: string;
    imageUrl?: string | null;
};

type Mahasiswa = {
    id: number;
    name: string;
    nim: string;
    urutan: number;
};

type TugasAkhir = {
    id: number;
    judul: string;
    tahunMasuk: number;
    mahasiswa: Mahasiswa[];
    programStudy: ProgramStudy | null;
    ruangan?: {
        id: number;
        name: string;
    } | null;
    sdgs: SDGs[];
};

type StatistikTahun = {
    tahun: number;
    jumlah: number;
};

type StatistikProgramStudy = {
    id: number;
    name: string;
    degree: string;
    jumlah: number;
};

type StatistikResponse = {
    dosen: {
        id: number;
        name: string;
    };
    statistik: {
        currentYear: number;
        bimbinganTahunIni: number;
        totalBimbingan: number;
        totalMenguji: number;
        statistikPerTahun: StatistikTahun[];
        pengujiPerTahun: StatistikTahun[];
        statistikPerProgramStudy: StatistikProgramStudy[];
        statistikPerProgramStudyPenguji: StatistikProgramStudy[];
        laporanPiPerTahun: StatistikTahun[];
        laporanPlkPerTahun: StatistikTahun[];
    };
    tugasAkhir: TugasAkhir[];
    pengujiTugasAkhir?: Array<{
        tahunMasuk: number;
        programStudy: ProgramStudy | null;
    }>;
};

// Warna Resmi SDGs PBB
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

const PROGRAM_COLORS = [
    "#2563EB", // Blue
    "#10B981", // Emerald
    "#8B5CF6", // Violet
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#06B6D4", // Cyan
    "#EC4899", // Pink
];

// Custom Tooltip untuk Donut Chart (High z-index to avoid clipping & overlap with center text)
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

// Custom Tooltip untuk Recharts Bar Chart
function CustomBarTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md p-3 text-xs text-white shadow-2xl space-y-1.5 min-w-[150px] z-[1000] pointer-events-none">
            <p className="font-bold text-white border-b border-slate-700 pb-1">Tahun {label}</p>
            {payload.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name}:
                    </span>
                    <span className="font-bold text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

export default function StatistikDosenPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [data, setData] = useState<StatistikResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const ITEMS_PER_PAGE = 6;
    const currentYear = new Date().getFullYear();

    const [startYear, setStartYear] = useState(currentYear - 4);
    const [endYear, setEndYear] = useState(currentYear);

    // FETCH DATA
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(`/api/dosens/${id}/statistics`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Gagal mengambil statistik dosen");
                }
                setData(result);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    // FILTER DATA TA
    const filteredTugasAkhir = useMemo(() => {
        if (!data) return [];
        const keyword = search.toLowerCase().trim();

        const filteredByYear = data.tugasAkhir.filter((ta) => {
            return ta.tahunMasuk >= startYear && ta.tahunMasuk <= endYear;
        });

        if (!keyword) return filteredByYear;

        return filteredByYear.filter((ta) => {
            return (
                ta.judul.toLowerCase().includes(keyword) ||
                ta.mahasiswa?.some((m) => m.name.toLowerCase().includes(keyword)) ||
                ta.mahasiswa?.some((m) => m.nim.toLowerCase().includes(keyword)) ||
                ta.programStudy?.name.toLowerCase().includes(keyword) ||
                ta.programStudy?.degree.toLowerCase().includes(keyword) ||
                ta.sdgs?.some((s) => s.title.toLowerCase().includes(keyword) || s.code.toLowerCase().includes(keyword))
            );
        });
    }, [data, startYear, endYear, search]);

    // PAGINATION
    const totalPages = Math.max(1, Math.ceil(filteredTugasAkhir.length / ITEMS_PER_PAGE));
    const paginatedTugasAkhir = filteredTugasAkhir.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const availableYears = useMemo(() => {
        const allYears = [
            ...(data?.statistik.statistikPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.pengujiPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.laporanPiPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.laporanPlkPerTahun.map((item) => item.tahun) ?? []),
        ];
        if (allYears.length === 0) return { min: currentYear, max: currentYear };
        return { min: Math.min(...allYears), max: Math.max(...allYears) };
    }, [data, currentYear]);

    const yearOptions = useMemo(() => {
        const options = [];
        for (let y = availableYears.min; y <= availableYears.max; y++) {
            options.push(y);
        }
        return options;
    }, [availableYears]);

    // GABUNGAN TAHUNAN FOR RECHARTS
    const gabunganPerTahun = useMemo(() => {
        const tahunSet = new Set([
            ...(data?.statistik.statistikPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.pengujiPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.laporanPiPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.laporanPlkPerTahun.map((item) => item.tahun) ?? []),
        ]);

        return Array.from(tahunSet)
            .filter((tahun) => tahun >= startYear && tahun <= endYear)
            .sort((a, b) => a - b)
            .map((tahun) => {
                const dibimbing = data?.statistik.statistikPerTahun.find((item) => item.tahun === tahun);
                const diuji = data?.statistik.pengujiPerTahun.find((item) => item.tahun === tahun);
                const laporanPi = data?.statistik.laporanPiPerTahun.find((item) => item.tahun === tahun);
                const laporanPlk = data?.statistik.laporanPlkPerTahun.find((item) => item.tahun === tahun);
                return {
                    tahun,
                    jumlahDibimbing: dibimbing?.jumlah ?? 0,
                    jumlahDiuji: diuji?.jumlah ?? 0,
                    jumlahPi: laporanPi?.jumlah ?? 0,
                    jumlahPlk: laporanPlk?.jumlah ?? 0,
                };
            });
    }, [data, startYear, endYear]);

    // FILTER PENGUJI TA
    const filteredPengujiTugasAkhir = useMemo(() => {
        if (!data?.pengujiTugasAkhir) return [];
        return data.pengujiTugasAkhir.filter((item) => item.tahunMasuk >= startYear && item.tahunMasuk <= endYear);
    }, [data, startYear, endYear]);

    // PROGRAM STUDY DIBIMBING
    const programStudyData = useMemo(() => {
        if (!data) return [];
        const map = new Map<number, { id: number; name: string; degree: string; jumlah: number }>();
        filteredTugasAkhir.forEach((ta) => {
            if (!ta.programStudy) return;
            const existing = map.get(ta.programStudy.id);
            map.set(ta.programStudy.id, {
                id: ta.programStudy.id,
                name: ta.programStudy.name,
                degree: ta.programStudy.degree,
                jumlah: (existing?.jumlah ?? 0) + 1,
            });
        });
        return Array.from(map.values()).sort((a, b) => b.jumlah - a.jumlah);
    }, [filteredTugasAkhir, data]);

    const totalProgramStudy = programStudyData.reduce((total, program) => total + program.jumlah, 0);

    // PROGRAM STUDY DIUJI
    const programStudyPengujiData = useMemo(() => {
        const map = new Map<number, { id: number; name: string; degree: string; jumlah: number }>();
        filteredPengujiTugasAkhir.forEach((entry) => {
            if (!entry.programStudy) return;
            const existing = map.get(entry.programStudy.id);
            map.set(entry.programStudy.id, {
                id: entry.programStudy.id,
                name: entry.programStudy.name,
                degree: entry.programStudy.degree,
                jumlah: (existing?.jumlah ?? 0) + 1,
            });
        });
        return Array.from(map.values()).sort((a, b) => b.jumlah - a.jumlah);
    }, [filteredPengujiTugasAkhir]);

    const totalProgramStudyPenguji = programStudyPengujiData.reduce((total, program) => total + program.jumlah, 0);

    // LAPORAN PI & PLK
    const laporanPiData = useMemo(() => {
        if (!data) return [];
        return data.statistik.laporanPiPerTahun.filter(
            (laporan) => laporan.tahun >= startYear && laporan.tahun <= endYear && laporan.jumlah > 0
        );
    }, [data, startYear, endYear]);

    const totalLaporanPi = laporanPiData.reduce((total, laporan) => total + laporan.jumlah, 0);

    const laporanPlkData = useMemo(() => {
        if (!data) return [];
        return data.statistik.laporanPlkPerTahun.filter(
            (laporan) => laporan.tahun >= startYear && laporan.tahun <= endYear && laporan.jumlah > 0
        );
    }, [data, startYear, endYear]);

    const totalLaporanPlk = laporanPlkData.reduce((total, laporan) => total + laporan.jumlah, 0);

    // SDGS IMPACT ANALYSIS
    const sdgsSummary = useMemo(() => {
        if (!data?.tugasAkhir) return [];
        const countMap = new Map<string, { code: string; title: string; imageUrl?: string | null; count: number }>();
        data.tugasAkhir.forEach((ta) => {
            ta.sdgs?.forEach((sdg) => {
                const existing = countMap.get(sdg.code);
                if (existing) {
                    existing.count += 1;
                } else {
                    countMap.set(sdg.code, { code: sdg.code, title: sdg.title, imageUrl: sdg.imageUrl, count: 1 });
                }
            });
        });
        return Array.from(countMap.values()).sort((a, b) => b.count - a.count);
    }, [data]);

    // RENDER COMPACT DONUT SECTIONS
    const renderDonutSection = (
        title: string,
        subtitle: string,
        icon: React.ReactNode,
        dataList: Array<{ id?: number | string; name?: string; degree?: string; tahun?: number; jumlah: number }>,
        total: number,
        unitLabel: string
    ) => (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                    <div className="flex items-center gap-1.5">
                        {icon}
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{title}</h3>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">{subtitle}</p>
                </div>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 shrink-0">
                    Total: {total}
                </span>
            </div>

            {dataList.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center p-3">
                    <p className="text-[11px] font-medium text-slate-400">Belum ada data pada periode ini.</p>
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
                                            fill={PROGRAM_COLORS[index % PROGRAM_COLORS.length]}
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
                                            style={{ backgroundColor: PROGRAM_COLORS[index % PROGRAM_COLORS.length] }}
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

    // LOADING STATE
    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
                    <p className="text-xs font-medium text-slate-600">Memuat analisis statistik dosen...</p>
                </div>
            </main>
        );
    }

    // ERROR STATE
    if (error || !data) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center max-w-sm shadow-sm">
                    <p className="font-semibold text-red-600 mb-3 text-xs">{error || "Data statistik tidak ditemukan"}</p>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                    </button>
                </div>
            </main>
        );
    }

    const { dosen, statistik } = data;
    const initialName = dosen.name.charAt(0).toUpperCase();

    return (
        <main className="min-h-screen bg-slate-50/60 pb-12">
            {/* ── Top Navigation / Breadcrumb ── */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <button
                            onClick={() => router.push("/dosen")}
                            className="font-medium hover:text-blue-600 transition flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Daftar Dosen
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">
                            {dosen.name}
                        </span>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-md transition"
                    >
                        Kembali
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 space-y-6">
                {/* ── Hero Profile Card (Compact & Balanced) ── */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1F3A] via-[#132D52] to-[#1e40af] p-4 sm:p-6 shadow-md text-white">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl" />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                        {/* Profile Info */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-xl sm:text-2xl font-extrabold text-white ring-2 ring-white/20 shadow-md">
                                {initialName}
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 text-[10px] font-bold border border-blue-300/20">
                                        <Sparkles className="w-3 h-3 text-blue-300" /> Dosen Pembimbing & Penguji
                                    </span>
                                </div>
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                                    {dosen.name}
                                </h1>
                                <p className="mt-0.5 text-xs text-slate-300 flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                                    Fakultas Teknik Otomotif UNP
                                </p>
                            </div>
                        </div>

                        {/* Top KPI Metrics Row (Compact) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:w-[480px] shrink-0">
                            <div className="rounded-xl bg-white/10 backdrop-blur-md p-2.5 border border-white/15 text-center">
                                <div className="flex items-center justify-center mb-0.5 text-blue-300">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                                    TA Dibimbing
                                </p>
                                <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5 leading-none">
                                    {statistik.totalBimbingan}
                                </p>
                                <p className="text-[9px] text-blue-200 mt-1 font-medium">
                                    {statistik.bimbinganTahunIni} di {statistik.currentYear}
                                </p>
                            </div>

                            <div className="rounded-xl bg-white/10 backdrop-blur-md p-2.5 border border-white/15 text-center">
                                <div className="flex items-center justify-center mb-0.5 text-purple-300">
                                    <Award className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                                    TA Diuji
                                </p>
                                <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5 leading-none">
                                    {statistik.totalMenguji}
                                </p>
                                <p className="text-[9px] text-purple-200 mt-1 font-medium">Penguji TA</p>
                            </div>

                            <div className="rounded-xl bg-white/10 backdrop-blur-md p-2.5 border border-white/15 text-center">
                                <div className="flex items-center justify-center mb-0.5 text-emerald-300">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                                    PI & PLK
                                </p>
                                <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5 leading-none">
                                    {totalLaporanPi + totalLaporanPlk}
                                </p>
                                <p className="text-[9px] text-emerald-200 mt-1 font-medium">Laporan Lapangan</p>
                            </div>

                            <div className="rounded-xl bg-white/10 backdrop-blur-md p-2.5 border border-white/15 text-center">
                                <div className="flex items-center justify-center mb-0.5 text-amber-300">
                                    <Target className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                                    SDGs
                                </p>
                                <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5 leading-none">
                                    {sdgsSummary.length}
                                </p>
                                <p className="text-[9px] text-amber-200 mt-1 font-medium">Goal SDGs</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Global Filter Bar ── */}
                <section className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <Filter className="w-3.5 h-3.5 text-blue-600" />
                        <span>Filter Periode Analisis:</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">Dari:</span>
                            <select
                                value={startYear}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setStartYear(val);
                                    if (val > endYear) setEndYear(val);
                                    setPage(1);
                                }}
                                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <span className="font-semibold text-slate-400">s/d</span>

                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">Sampai:</span>
                            <select
                                value={endYear}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEndYear(val);
                                    if (val < startYear) setStartYear(val);
                                    setPage(1);
                                }}
                                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* ── Multi-Year Combined Trend Chart ── */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                    Tren Kinerja Akademik ({startYear} - {endYear})
                                </h2>
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                Perbandingan aktivitas bimbingan TA, penguji TA, laporan PI, dan PLK per tahun.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-600">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                                <span className="h-2 w-2 rounded-full bg-blue-600" /> TA Dibimbing
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                                <span className="h-2 w-2 rounded-full bg-purple-600" /> TA Diuji
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="h-2 w-2 rounded-full bg-emerald-600" /> Laporan PI
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                                <span className="h-2 w-2 rounded-full bg-amber-600" /> Laporan PLK
                            </span>
                        </div>
                    </div>

                    {gabunganPerTahun.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                            <p className="text-xs font-medium text-slate-400">Tidak ada data aktivitas pada rentang tahun ini.</p>
                        </div>
                    ) : (
                        <div className="h-56 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gabunganPerTahun} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#64748B" }} />
                                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                                    <Tooltip wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }} content={<CustomBarTooltip />} />
                                    <Bar dataKey="jumlahDibimbing" name="TA Dibimbing" fill="#2563EB" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="jumlahDiuji" name="TA Diuji" fill="#9333EA" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="jumlahPi" name="Laporan PI" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="jumlahPlk" name="Laporan PLK" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </section>

                {/* ── 4 Donut Analytics Charts Grid (Compact Layout) ── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {renderDonutSection(
                        "TA Dibimbing per Prodi",
                        "Sebaran Program Studi TA",
                        <GraduationCap className="w-4 h-4 text-blue-600" />,
                        programStudyData,
                        totalProgramStudy,
                        "TA"
                    )}

                    {renderDonutSection(
                        "TA Diuji per Prodi",
                        "Sebaran Program Studi Penguji",
                        <Award className="w-4 h-4 text-purple-600" />,
                        programStudyPengujiData,
                        totalProgramStudyPenguji,
                        "Penguji"
                    )}

                    {renderDonutSection(
                        "Laporan PI per Tahun",
                        "Sebaran Praktik Industri",
                        <Briefcase className="w-4 h-4 text-emerald-600" />,
                        laporanPiData,
                        totalLaporanPi,
                        "PI"
                    )}

                    {renderDonutSection(
                        "Laporan PLK per Tahun",
                        "Sebaran Praktik Lapangan Kerja",
                        <Users className="w-4 h-4 text-amber-600" />,
                        laporanPlkData,
                        totalLaporanPlk,
                        "PLK"
                    )}
                </div>

                {/* ── SDGs Impact Insight Section (HANYA MEMUAT GAMBAR LOGO UPLOADED ADMIN) ── */}
                {sdgsSummary.length > 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Target className="w-4 h-4 text-emerald-600" />
                            <h2 className="text-sm font-bold text-slate-900">
                                Kontribusi Sustainable Development Goals (SDGs)
                            </h2>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-4">
                            Ikon SDGs yang pernah terkontribusi melalui topik Tugas Akhir bimbingan {dosen.name}.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            {sdgsSummary.map((sdg) => {
                                const color = getSdgColor(sdg.code);
                                return (
                                    <div
                                        key={sdg.code}
                                        className="group relative flex items-center justify-center cursor-pointer"
                                        title={`${sdg.code} - ${sdg.title} (${sdg.count} Karya Terkait)`}
                                    >
                                        <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
                                            {sdg.imageUrl ? (
                                                <img
                                                    src={sdg.imageUrl}
                                                    alt={sdg.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="flex h-full w-full items-center justify-center p-1 text-center font-black text-white text-[11px]"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {sdg.code}
                                                </div>
                                            )}

                                            {/* Badge Count Top Right */}
                                            <span className="absolute top-1 right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900/85 backdrop-blur-xs px-1 text-[10px] font-bold text-white shadow-xs">
                                                {sdg.count}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── Filterable Data Table: Tugas Akhir Dibimbing (Compact & Legible) ── */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Header Controls */}
                    <div className="border-b border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Daftar Tugas Akhir Dibimbing
                            </h2>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                                Total {filteredTugasAkhir.length} Tugas Akhir ditemukan ({startYear} - {endYear})
                            </p>
                        </div>

                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Cari judul, mahasiswa, NIM..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-8 py-1.5 text-xs outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="px-4 py-2.5 w-12">No.</th>
                                    <th className="px-4 py-2.5">Judul Tugas Akhir</th>
                                    <th className="px-4 py-2.5">Mahasiswa</th>
                                    <th className="px-4 py-2.5">NIM</th>
                                    <th className="px-4 py-2.5">Tahun</th>
                                    <th className="px-4 py-2.5">Program Studi</th>
                                    <th className="px-4 py-2.5">SDGs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {paginatedTugasAkhir.map((ta, index) => (
                                    <tr key={ta.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-2.5 font-semibold text-slate-400 text-xs">
                                            {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className="px-4 py-2.5 max-w-[280px]">
                                            <p className="font-semibold text-slate-800 leading-snug line-clamp-2 text-xs">
                                                {ta.judul}
                                            </p>
                                            {ta.ruangan && (
                                                <span className="mt-0.5 inline-flex items-center text-[10px] text-slate-400 font-medium">
                                                    Ruang: {ta.ruangan.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {ta.mahasiswa && ta.mahasiswa.length > 0 ? (
                                                <div className="space-y-0.5">
                                                    {ta.mahasiswa.map((m) => (
                                                        <div key={m.id} className="flex items-center gap-1.5">
                                                            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-700">
                                                                {m.name.charAt(0)}
                                                            </span>
                                                            <span className="font-semibold text-slate-700 text-xs">{m.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 font-medium text-slate-500 text-xs">
                                            {ta.mahasiswa?.map((m) => m.nim).join(", ") || "-"}
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
                                                <span className="text-slate-400 text-[10px]">Belum diatur</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            {ta.sdgs && ta.sdgs.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {ta.sdgs.map((sdg) => (
                                                        <span
                                                            key={sdg.id}
                                                            className="inline-flex h-4.5 w-4.5 items-center justify-center rounded text-[9px] font-extrabold text-white"
                                                            style={{ backgroundColor: getSdgColor(sdg.code) }}
                                                            title={sdg.title}
                                                        >
                                                            {sdg.code.replace(/\D/g, "")}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic">Tidak ada</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty Table State */}
                    {paginatedTugasAkhir.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <p className="font-bold text-slate-800 text-xs">Tidak ada Tugas Akhir ditemukan</p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                                Coba sesuaikan rentang tahun atau kata kunci pencarian Anda.
                            </p>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {filteredTugasAkhir.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs">
                            <p className="text-slate-500 text-[11px]">
                                Menampilkan{" "}
                                <span className="font-bold text-slate-800">
                                    {(page - 1) * ITEMS_PER_PAGE + 1}
                                </span>{" "}
                                -{" "}
                                <span className="font-bold text-slate-800">
                                    {Math.min(page * ITEMS_PER_PAGE, filteredTugasAkhir.length)}
                                </span>{" "}
                                dari <span className="font-bold text-slate-800">{filteredTugasAkhir.length}</span> data
                            </p>

                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setPage(pageNumber)}
                                        className={`h-7 min-w-7 rounded px-2 text-[11px] font-bold transition ${
                                            page === pageNumber
                                                ? "bg-blue-600 text-white shadow-xs"
                                                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}