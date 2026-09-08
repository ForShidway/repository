"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from "recharts";

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
};

type SDGs = {
    id: number;
    code: string;
    title: string;
};

type Mahasiswa = {
    id: number;
    name: string;
    nim: string;
    urutan: number;
}

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

type StatistikLaporanPi = {
    tahun: number;
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
        pengujiPerTahun : StatistikTahun[];
        statistikPerProgramStudy: StatistikProgramStudy[];
        statistikPerProgramStudyPenguji: StatistikProgramStudy[];
        laporanPiPerTahun: StatistikTahun[];
    };

    tugasAkhir: TugasAkhir[];
};

export default function StatistikDosenPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id;

    const [data, setData] =
        useState<StatistikResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const ITEMS_PER_PAGE = 6;

    const currentYear = new Date().getFullYear();
    const [startYear, setStartYear] = useState(currentYear - 4);
    const [endYear, setEndYear] = useState(currentYear);

    const PROGRAM_COLORS = [
        "#3b82f6",
        "#10b981",
        "#8b5cf6",
        "#f97316",
        "#ef4444",
        "#14b8a6",
    ];

    function ProgramStudyTooltip({
        active,
        payload,
        total,
    }: {
        active?: boolean;
        payload?: any[];
        total: number;
    }) {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload as StatistikProgramStudy;
        const percentage =
            total > 0 ? Math.round((data.jumlah / total) * 100) : 0;

        return (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-lg">
                <p className="font-semibold text-slate-800">{data.name}</p>
                <p className="text-slate-400">{data.degree}</p>
                <p className="mt-1 text-sm font-bold text-blue-600">
                    {data.jumlah} TA{" "}
                    <span className="font-medium text-slate-500">
                        ({percentage}%)
                    </span>
                </p>
            </div>
        );
    }

    function LaporanPiTooltip({
        active,
        payload,
        total,
    }: {
        active?: boolean;
        payload?: any[];
        total: number;
    }) {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload as StatistikLaporanPi;
        const percentage = total > 0 ? Math.round((data.jumlah / total) * 100) : 0;

        return (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-lg">
                <p className="font-semibold text-slate-800">Tahun {data.tahun}</p>
                <p className="mt-1 text-sm font-bold text-emerald-600">
                    {data.jumlah} laporan PI <span className="font-medium text-slate-500">({percentage}%)</span>
                </p>
            </div>
        );
    }

    // ==========================================
    // FETCH DATA
    // ==========================================

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/dosens/${id}/statistics`
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                            "Gagal mengambil statistik dosen"
                    );
                }

                setData(result);
            } catch (error) {
                console.error(error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Terjadi kesalahan"
                );
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    // ==========================================
    // FILTER DATA
    // ==========================================

    const filteredTugasAkhir = useMemo(() => {
        if (!data) return [];

        const keyword =
            search.toLowerCase().trim();

        if (!keyword) {
            return data.tugasAkhir;
        }

        return data.tugasAkhir.filter((ta) => {
            return (
                ta.judul
                    .toLowerCase()
                    .includes(keyword) ||
                ta.mahasiswa?.some((m) =>
                    m.name
                        .toLowerCase()
                        .includes(keyword)
                ) ||
                ta.mahasiswa?.some((m) =>
                    m.nim
                        .toLowerCase()
                        .includes(keyword)
                ) ||
                ta.programStudy?.name
                    .toLowerCase()
                    .includes(keyword) ||
                ta.programStudy?.degree
                    .toLowerCase()
                    .includes(keyword)
            );
        });
    }, [data, search]);

    // ==========================================
    // PAGINATION
    // ==========================================

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredTugasAkhir.length /
                ITEMS_PER_PAGE
        )
    );

    const paginatedTugasAkhir =
        filteredTugasAkhir.slice(
            (page - 1) * ITEMS_PER_PAGE,
            page * ITEMS_PER_PAGE
        );

    useEffect(() => {
        setPage(1);
    }, [search]);

    const availableYears = useMemo(() => {
        const allYears = [
            ...(data?.statistik.statistikPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.pengujiPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.laporanPiPerTahun.map((item) => item.tahun) ?? []),
        ];
        if (allYears.length === 0) return { min: currentYear, max: currentYear };
        return { min: Math.min(...allYears), max: Math.max(...allYears) };
    }, [data, currentYear]);

    const gabunganPerTahun = useMemo(() => {
        const tahunSet = new Set([
            ...(data?.statistik.statistikPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.pengujiPerTahun.map((item) => item.tahun) ?? []),
            ...(data?.statistik.laporanPiPerTahun.map((item) => item.tahun) ?? []),
        ]);

        return Array.from(tahunSet)
            .filter((tahun) => tahun >= startYear && tahun <= endYear)
            .sort((a, b) => a - b)
            .map((tahun) => {
                const dibimbing = data?.statistik.statistikPerTahun.find((item) => item.tahun === tahun);
                const diuji = data?.statistik.pengujiPerTahun.find((item) => item.tahun === tahun);
                const laporanPi = data?.statistik.laporanPiPerTahun.find((item) => item.tahun === tahun);
                return {
                    tahun,
                    jumlahDibimbing: dibimbing?.jumlah ?? 0,
                    jumlahDiuji: diuji?.jumlah ?? 0,
                    jumlahPi: laporanPi?.jumlah ?? 0,
                };
            });
    }, [data, startYear, endYear]);

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Memuat statistik dosen...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error || !data) {
        return (
            <main className="min-h-screen bg-slate-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <p className="font-medium text-red-700">
                            {error ||
                                "Data tidak ditemukan"}
                        </p>

                        <button
                            onClick={() =>
                                router.back()
                            }
                            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                        >
                            ← Kembali
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const {
        dosen,
        statistik,
        tugasAkhir,
    } = data;

    const yearOptions = Array.from(
        { length: availableYears.max - availableYears.min + 1 },
        (_, index) => availableYears.min + index
    );

    const maxGabungan = Math.max(
        ...gabunganPerTahun.map((item) => Math.max(item.jumlahDibimbing, item.jumlahDiuji, item.jumlahPi)),
        1
    );

    const maxJumlah =
        Math.max(
            ...statistik.statistikPerTahun.map(
                (item) => item.jumlah
            ),
            1
        );

    const programStudyData = statistik.statistikPerProgramStudy.filter(
        (program) => program.jumlah > 0
    );
    const totalProgramStudy = programStudyData.reduce(
        (total, program) => total + program.jumlah,
        0
    );
    const programStudyPengujiData = statistik.statistikPerProgramStudyPenguji.filter(
        (program) => program.jumlah > 0
    );
    const totalProgramStudyPenguji = programStudyPengujiData.reduce(
        (total, program) => total + program.jumlah,
        0
    );
    const laporanPiData = statistik.laporanPiPerTahun.filter(
        (laporan) => laporan.jumlah > 0
    );
    const totalLaporanPi = laporanPiData.reduce(
        (total, laporan) => total + laporan.jumlah,
        0
    );

    const renderProgramStudyDonut = (
        title: string,
        description: string,
        programs: StatistikProgramStudy[],
        total: number
    ) => (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>

            {programs.length === 0 ? (
                <div className="flex h-56 items-center justify-center">
                    <p className="text-sm text-slate-400">Belum ada data program studi.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-5">
                    <div className="relative h-56 w-full max-w-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={programs}
                                    dataKey="jumlah"
                                    nameKey="name"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={programs.length > 1 ? 3 : 0}
                                >
                                    {programs.map((program, index) => (
                                        <Cell
                                            key={program.id}
                                            fill={PROGRAM_COLORS[index % PROGRAM_COLORS.length]}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<ProgramStudyTooltip total={total} />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold text-slate-900">{total}</p>
                            <p className="text-xs text-slate-400">Total TA</p>
                        </div>
                    </div>

                    <div className="w-full max-w-[280px] space-y-3">
                        {programs.map((program, index) => {
                            const percentage = Math.round((program.jumlah / total) * 100);

                            return (
                                <div key={program.id} className="flex items-center justify-between gap-3 text-sm">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: PROGRAM_COLORS[index % PROGRAM_COLORS.length] }}
                                        />
                                        <span className="truncate font-medium text-slate-700">{program.name}</span>
                                    </div>
                                    <span className="shrink-0 font-semibold text-slate-600">
                                        {program.jumlah} · {percentage}%
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
        <main className="min-h-screen bg-[#F4F9F9] px-6 py-8 md:px-8">
            <div className="mx-auto max-w-7xl">

                {/* ==================================
                    BREADCRUMB
                ================================== */}

                <div className="mb-6 flex items-center gap-2 text-sm">
                    <button
                        onClick={() =>
                            router.push("/dosen")
                        }
                        className="text-slate-500 transition hover:text-blue-600"
                    >
                        Daftar Dosen
                    </button>

                    <span className="text-slate-300">
                        /
                    </span>

                    <span className="font-medium text-slate-700">
                        Statistik Dosen
                    </span>
                </div>

                {/* ==================================
                    HEADER
                ================================== */}

                <section className="mb-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
                        Repository Otomotif
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Statistik Dosen Pembimbing
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Ringkasan bimbingan Tugas Akhir
                        dan daftar mahasiswa yang pernah
                        dibimbing.
                    </p>
                </section>

                {/* ==================================
                    PROFILE + KPI
                ================================== */}

                <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center">

                        {/* PROFILE */}

                        <div className="flex flex-1 items-center gap-5">

                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700 ring-8 ring-blue-50">
                                {dosen.name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>

                          
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {dosen.name}
                                </h2>
                                <p className="mt-3 text-sm text-slate-500">
                                    Pembimbing Tugas Akhir
                                    Repository Otomotif
                                </p>
                            </div>

                        </div>

                        {/* KPI */}

                        <div className="grid grid-cols-3 gap-4 lg:w-[600px]">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-center">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Bimbingan Tahun Ini
                                </p>
                                <p className="mt-2 text-4xl font-bold text-blue-600">
                                    {statistik.bimbinganTahunIni}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    TA pada {statistik.currentYear}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-center">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Total Bimbingan
                                </p>
                                <p className="mt-2 text-4xl font-bold text-slate-900">
                                    {statistik.totalBimbingan}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    seluruh TA
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-center">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Total Menguji
                                </p>
                                <p className="mt-2 text-4xl font-bold text-violet-600">
                                    {statistik.totalMenguji}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    sebagai penguji TA
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================================
                    CHART + SUMMARY
                ================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Statistik Bimbingan, Penguji &amp; PI per Tahun
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Perbandingan jumlah TA yang dibimbing, diuji, dan laporan PI per tahun.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={startYear}
                                onChange={(e) => setStartYear(Number(e.target.value))}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
                            >
                                {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <span className="text-xs text-slate-400">sampai</span>
                            <select
                                value={endYear}
                                onChange={(e) => setEndYear(Number(e.target.value))}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
                            >
                                {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="mb-4 flex items-center gap-5 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                            <span className="font-medium text-slate-600">Dibimbing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                            <span className="font-medium text-slate-600">Diuji</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span className="font-medium text-slate-600">PLI</span>
                        </div>
                    </div>

                    {gabunganPerTahun.length === 0 ? (
                        <div className="flex h-64 items-center justify-center">
                            <p className="text-sm text-slate-400">
                                Belum ada data pada rentang tahun ini.
                            </p>
                        </div>
                    ) : (
                        <div className="flex h-80 items-end gap-4 overflow-x-auto overflow-y-visible px-2 pb-8 pt-16">
                            {gabunganPerTahun.map((item) => {
                                const heightDibimbing = Math.max(
                                    (item.jumlahDibimbing / maxGabungan) * 160,
                                    item.jumlahDibimbing > 0 ? 12 : 0
                                );
                                const heightDiuji = Math.max(
                                    (item.jumlahDiuji / maxGabungan) * 160,
                                    item.jumlahDiuji > 0 ? 12 : 0
                                );
                                const heightPi = Math.max(
                                    (item.jumlahPi / maxGabungan) * 160,
                                    item.jumlahPi > 0 ? 12 : 0
                                );

                                return (
                                    <div
                                        key={item.tahun}
                                        className="group relative flex min-w-[70px] flex-1 flex-col items-center justify-end overflow-visible"
                                    >
                                        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs opacity-0 shadow-lg transition group-hover:opacity-100">
                                            <p className="font-semibold text-slate-800">
                                                Tahun {item.tahun}
                                            </p>
                                            <p className="mt-0.5 font-bold text-blue-600">
                                                {item.jumlahDibimbing} TA Dibimbing
                                            </p>
                                            <p className="font-bold text-violet-600">
                                                {item.jumlahDiuji} TA Diuji
                                            </p>
                                            <p className="font-bold text-emerald-600">
                                                {item.jumlahPi} PLI
                                            </p>
                                            <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-200 bg-white" />
                                        </div>

                                        <div className="flex items-end gap-1.5">
                                            <div className="flex flex-col items-center">
                                                <span className="mb-1 text-xs font-bold text-slate-600">
                                                    {item.jumlahDibimbing}
                                                </span>
                                                <div
                                                    className="w-6 cursor-pointer rounded-t-lg bg-blue-500 transition hover:bg-blue-600"
                                                    style={{ height: `${heightDibimbing}px` }}
                                                />
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <span className="mb-1 text-xs font-bold text-slate-600">
                                                    {item.jumlahDiuji}
                                                </span>
                                                <div
                                                    className="w-6 cursor-pointer rounded-t-lg bg-violet-500 transition hover:bg-violet-600"
                                                    style={{ height: `${heightDiuji}px` }}
                                                />
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <span className="mb-1 text-xs font-bold text-slate-600">
                                                    {item.jumlahPi}
                                                </span>
                                                <div
                                                    className="w-6 cursor-pointer rounded-t-lg bg-emerald-500 transition hover:bg-emerald-600"
                                                    style={{ height: `${heightPi}px` }}
                                                />
                                            </div>
                                        </div>

                                        <span className="mt-3 text-xs font-medium text-slate-500">
                                            {item.tahun}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* PROGRAM STUDY */}

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    {renderProgramStudyDonut(
                        "TA Dibimbing per Program Studi",
                        "Sebaran Tugas Akhir yang pernah dibimbing.",
                        programStudyData,
                        totalProgramStudy
                    )}
                    {renderProgramStudyDonut(
                        "TA Diuji per Program Studi",
                        "Sebaran Tugas Akhir yang pernah diuji.",
                        programStudyPengujiData,
                        totalProgramStudyPenguji
                    )}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-900">
                            Laporan PI per Tahun
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Distribusi jumlah laporan Praktik Industri berdasarkan tahun mulai.
                        </p>
                    </div>

                    {laporanPiData.length === 0 ? (
                        <div className="flex h-56 items-center justify-center">
                            <p className="text-sm text-slate-400">Belum ada data laporan PI.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-5">
                            <div className="relative h-56 w-full max-w-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={laporanPiData}
                                            dataKey="jumlah"
                                            nameKey="tahun"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={laporanPiData.length > 1 ? 3 : 0}
                                        >
                                            {laporanPiData.map((laporan, index) => (
                                                <Cell
                                                    key={laporan.tahun}
                                                    fill={PROGRAM_COLORS[index % PROGRAM_COLORS.length]}
                                                    stroke="#fff"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={<LaporanPiTooltip total={totalLaporanPi} />}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-2xl font-bold text-slate-900">{totalLaporanPi}</p>
                                    <p className="text-xs text-slate-400">Total PI</p>
                                </div>
                            </div>

                            <div className="w-full max-w-[280px] space-y-3">
                                {laporanPiData.map((laporan, index) => {
                                    const percentage = Math.round((laporan.jumlah / totalLaporanPi) * 100);

                                    return (
                                        <div key={laporan.tahun} className="flex items-center justify-between gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: PROGRAM_COLORS[index % PROGRAM_COLORS.length] }}
                                                />
                                                <span className="font-medium text-slate-700">{laporan.tahun}</span>
                                            </div>
                                            <span className="font-semibold text-slate-600">
                                                {laporan.jumlah} · {percentage}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
                </div>

                {/* ==================================
                    DAFTAR TA
                ================================== */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* HEADER */}

                    <div className="border-b border-slate-100 p-6">

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Daftar Tugas Akhir yang
                                    Pernah Dibimbing
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {filteredTugasAkhir.length}{" "}
                                    data ditemukan
                                </p>
                            </div>

                            <div className="relative w-full md:w-80">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Cari judul, nama, atau NIM..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />

                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    ⌕
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* TABLE */}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px]">

                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        No.
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Judul Tugas Akhir
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Mahasiswa
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        NIM
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Tahun
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Program Studi
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {paginatedTugasAkhir.map(
                                    (ta, index) => (
                                        <tr
                                            key={ta.id}
                                            className="transition hover:bg-slate-50"
                                        >

                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {(page -
                                                    1) *
                                                    ITEMS_PER_PAGE +
                                                    index +
                                                    1}
                                            </td>

                                            <td className="max-w-[330px] px-6 py-4">
                                                <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
                                                    {
                                                        ta.judul
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                <strong>
                                                    {ta.mahasiswa?.map((m) => m.name).join(", ") || "-"}
                                                </strong>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {ta.mahasiswa?.map((m) => m.nim).join(", ") || "-"}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {
                                                    ta.tahunMasuk
                                                }
                                            </td>

                                            <td className="px-6 py-4">
                                                {ta.programStudy ? (
                                                    <div>
                                                        <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                                                            {
                                                                ta
                                                                    .programStudy
                                                                    .degree
                                                            }
                                                        </span>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {
                                                                ta
                                                                    .programStudy
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        Belum tersedia
                                                    </span>
                                                )}
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>
                    </div>

                    {/* EMPTY */}

                    {paginatedTugasAkhir.length ===
                        0 && (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                📚
                            </div>

                            <p className="font-medium text-slate-700">
                                Tidak ada data
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Tidak ditemukan Tugas Akhir
                                yang sesuai pencarian.
                            </p>
                        </div>
                    )}

                    {/* PAGINATION */}

                    {filteredTugasAkhir.length > 0 && (
                        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">

                            <p className="text-sm text-slate-500">
                                Menampilkan{" "}
                                <span className="font-semibold text-slate-700">
                                    {(page - 1) *
                                        ITEMS_PER_PAGE +
                                        1}
                                </span>{" "}
                                -
                                <span className="font-semibold text-slate-700">
                                    {" "}
                                    {Math.min(
                                        page *
                                            ITEMS_PER_PAGE,
                                        filteredTugasAkhir.length
                                    )}
                                </span>{" "}
                                dari{" "}
                                <span className="font-semibold text-slate-700">
                                    {
                                        filteredTugasAkhir.length
                                    }
                                </span>{" "}
                                data
                            </p>

                            <div className="flex items-center gap-2">

                                <button
                                    disabled={page === 1}
                                    onClick={() =>
                                        setPage(
                                            (prev) =>
                                                Math.max(
                                                    prev -
                                                        1,
                                                    1
                                                )
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ←
                                </button>

                                {Array.from(
                                    {
                                        length: totalPages,
                                    },
                                    (_, index) =>
                                        index + 1
                                ).map(
                                    (pageNumber) => (
                                        <button
                                            key={
                                                pageNumber
                                            }
                                            onClick={() =>
                                                setPage(
                                                    pageNumber
                                                )
                                            }
                                            className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                                                page ===
                                                pageNumber
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {
                                                pageNumber
                                            }
                                        </button>
                                    )
                                )}

                                <button
                                    disabled={
                                        page ===
                                        totalPages
                                    }
                                    onClick={() =>
                                        setPage(
                                            (prev) =>
                                                Math.min(
                                                    prev +
                                                        1,
                                                    totalPages
                                                )
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    →
                                </button>

                            </div>
                        </div>
                    )}

                </section>

            </div>
        </main>
    );
}