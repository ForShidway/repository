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
        laporanPlkPerTahun: StatistikTahun[];
    };

    tugasAkhir: TugasAkhir[];
    pengujiTugasAkhir?: Array<{
        tahunMasuk: number;
        programStudy: ProgramStudy | null;
    }>;
};

function ProgramStudyTooltip({
    active,
    payload,
    total,
}: {
    active?: boolean;
    payload?: Array<{ payload: StatistikProgramStudy }>;
    total: number;
}) {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
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

function LaporanTooltip({
    active,
    payload,
    total,
    label,
}: {
    active?: boolean;
    payload?: Array<{ payload: StatistikLaporanPi }>;
    total: number;
    label: string;
}) {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const percentage = total > 0 ? Math.round((data.jumlah / total) * 100) : 0;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-lg">
            <p className="font-semibold text-slate-800">Tahun {data.tahun}</p>
            <p className="mt-1 text-sm font-bold text-emerald-600">
                {data.jumlah} {label} <span className="font-medium text-slate-500">({percentage}%)</span>
            </p>
        </div>
    );
}

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

        const filteredByYear = data.tugasAkhir.filter((ta) => {
            return ta.tahunMasuk >= startYear && ta.tahunMasuk <= endYear;
        });

        if (!keyword) {
            return filteredByYear;
        }

        return filteredByYear.filter((ta) => {
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
    }, [data, startYear, endYear, search]);

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

    const filteredPengujiTugasAkhir = useMemo(() => {
        if (!data?.pengujiTugasAkhir) return [];

        return data.pengujiTugasAkhir.filter(
            (item) => item.tahunMasuk >= startYear && item.tahunMasuk <= endYear
        );
    }, [data, startYear, endYear]);

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

    const totalProgramStudy = programStudyData.reduce(
        (total, program) => total + program.jumlah,
        0
    );

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

    const totalProgramStudyPenguji = programStudyPengujiData.reduce(
        (total, program) => total + program.jumlah,
        0
    );

    const laporanPiData = useMemo(() => {
        if (!data) return [];

        return data.statistik.laporanPiPerTahun.filter(
            (laporan) => laporan.tahun >= startYear && laporan.tahun <= endYear && laporan.jumlah > 0
        );
    }, [data, startYear, endYear]);

    const totalLaporanPi = laporanPiData.reduce(
        (total, laporan) => total + laporan.jumlah,
        0
    );

    const laporanPlkData = useMemo(() => {
        if (!data) return [];

        return data.statistik.laporanPlkPerTahun.filter(
            (laporan) => laporan.tahun >= startYear && laporan.tahun <= endYear && laporan.jumlah > 0
        );
    }, [data, startYear, endYear]);

    const totalLaporanPlk = laporanPlkData.reduce(
        (total, laporan) => total + laporan.jumlah,
        0
    );

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

    const { dosen, statistik } = data;

    const yearOptions = Array.from(
        { length: availableYears.max - availableYears.min + 1 },
        (_, index) => availableYears.min + index
    );

    const maxGabungan = Math.max(
        ...gabunganPerTahun.map((item) => Math.max(item.jumlahDibimbing, item.jumlahDiuji, item.jumlahPi, item.jumlahPlk)),
        1
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
                <p className="mt-1 whitespace-normal break-words text-sm leading-relaxed text-slate-500">{description}</p>
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
                                <div key={program.id} className="flex items-center gap-3 text-sm">
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: PROGRAM_COLORS[index % PROGRAM_COLORS.length] }}
                                        />
                                        <span className="min-w-0 break-words font-medium leading-relaxed text-slate-700">
                                            {program.name}
                                        </span>
                                    </div>
                                    <span className="shrink-0 whitespace-nowrap font-semibold text-slate-600">
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
                                Statistik Gabungan per Tahun
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Perbandingan jumlah TA dibimbing, TA diuji, laporan PI, dan laporan PLK per tahun.
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

                    <div className="mb-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />Dibimbing</span>
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />Diuji</span>
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />PI</span>
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />PLK</span>
                    </div>

                    {gabunganPerTahun.length === 0 ? (
                        <div className="flex h-64 items-center justify-center">
                            <p className="text-sm text-slate-400">
                                Belum ada data pada rentang tahun ini.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-8 flex h-64 items-end gap-4 overflow-x-auto border-b border-l border-slate-200 px-2 pb-0">
                            {gabunganPerTahun.map((item, index) => (
                                <div key={item.tahun} className="group relative flex h-full min-w-[64px] flex-1 flex-col items-center justify-end">
                                    <div className="pointer-events-none absolute left-1/2 top-2 z-20 w-48 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-300">
                                            Tahun {item.tahun}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-sm bg-blue-500" />
                                            Dibimbing: {item.jumlahDibimbing}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-sm bg-violet-500" />
                                            Diuji: {item.jumlahDiuji}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                                            PI: {item.jumlahPi}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-sm bg-amber-500" />
                                            PLK: {item.jumlahPlk}
                                        </p>
                                        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-900" />
                                    </div>

                                    <div className="flex h-full w-full items-end justify-center gap-1">
                                        {[
                                            { key: 'dibimbing', label: 'Dibimbing', value: item.jumlahDibimbing, color: 'bg-blue-500' },
                                            { key: 'diuji', label: 'Diuji', value: item.jumlahDiuji, color: 'bg-violet-500' },
                                            { key: 'pi', label: 'PI', value: item.jumlahPi, color: 'bg-emerald-500' },
                                            { key: 'plk', label: 'PLK', value: item.jumlahPlk, color: 'bg-amber-500' },
                                        ].map((series) => {
                                            const height = Math.max((series.value / maxGabungan) * 100, series.value > 0 ? 6 : 0);

                                            return (
                                                <div key={series.key} className="flex h-full w-4 items-end">
                                                    <div
                                                        className={`${series.color} w-full rounded-t-sm transition-all duration-300`}
                                                        style={{ height: `${height}%` }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-3 line-clamp-1 max-w-[100px] text-center text-[11px] font-medium text-slate-400">
                                        {item.tahun}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PROGRAM STUDY */}

                <div className="mt-8 grid gap-6 lg:grid-cols-4">
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
                        <p className="mt-1 whitespace-normal break-words text-sm leading-relaxed text-slate-500">
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
                                            content={<LaporanTooltip total={totalLaporanPi} label="laporan PI" />}
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

                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-900">
                            Laporan PLK per Tahun
                        </h2>
                        <p className="mt-1 whitespace-normal break-words text-sm leading-relaxed text-slate-500">
                            Distribusi jumlah laporan Praktik Lapangan Kerja berdasarkan tahun mulai.
                        </p>
                    </div>

                    {laporanPlkData.length === 0 ? (
                        <div className="flex h-56 items-center justify-center">
                            <p className="text-sm text-slate-400">Belum ada data laporan PLK.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-5">
                            <div className="relative h-56 w-full max-w-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={laporanPlkData}
                                            dataKey="jumlah"
                                            nameKey="tahun"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={laporanPlkData.length > 1 ? 3 : 0}
                                        >
                                            {laporanPlkData.map((laporan, index) => (
                                                <Cell
                                                    key={laporan.tahun}
                                                    fill={PROGRAM_COLORS[index % PROGRAM_COLORS.length]}
                                                    stroke="#fff"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={<LaporanTooltip total={totalLaporanPlk} label="laporan PLK" />}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-2xl font-bold text-slate-900">{totalLaporanPlk}</p>
                                    <p className="text-xs text-slate-400">Total PLK</p>
                                </div>
                            </div>

                            <div className="w-full max-w-[280px] space-y-3">
                                {laporanPlkData.map((laporan, index) => {
                                    const percentage = Math.round((laporan.jumlah / totalLaporanPlk) * 100);

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

                <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

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
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
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