"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { BarChart3, Filter, Calendar } from "lucide-react";

type ProgramStudyOption = {
    id: number;
    name: string;
    degree: string;
};

type FilterState = {
    mode: "tahun" | "prodi";
    startYear: number;
    endYear: number;
    programStudyId: string;
};

type StatistikResponse = {
    labels: string[];
    series: {
        tugasAkhir: number[];
        artikelJurnal: number[];
        laporanPi: number[];
        laporanPlk: number[];
    };
    availableYears?: { min: number; max: number };
    lpiTotal?: number;
    catatan?: string;
};

const SERIES = [
    { key: "tugasAkhir", label: "Tugas Akhir", fill: "#2563EB" },
    { key: "artikelJurnal", label: "Artikel Jurnal", fill: "#06B6D4" },
    { key: "laporanPi", label: "Laporan PI", fill: "#10B981" },
    { key: "laporanPlk", label: "Laporan PLK", fill: "#F59E0B" },
] as const;

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
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md p-3 text-xs text-white shadow-2xl space-y-1.5 min-w-[160px] z-[1000] pointer-events-none">
            <p className="font-bold text-white border-b border-slate-700 pb-1">{label}</p>
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

export default function StatistikDashboard({
    programStudyOptions,
    onFilterChange,
}: {
    programStudyOptions: ProgramStudyOption[];
    onFilterChange?: (filter: FilterState) => void;
}) {
    const currentYear = new Date().getFullYear();
    const [mode, setMode] = useState<"tahun" | "prodi">("tahun");
    const [programStudyId, setProgramStudyId] = useState("all");
    const [startYear, setStartYear] = useState(currentYear - 4);
    const [endYear, setEndYear] = useState(currentYear);
    const [availableYears, setAvailableYears] = useState({ min: currentYear - 4, max: currentYear });
    const [data, setData] = useState<StatistikResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchData() {
            setLoading(true);
            setError("");
            try {
                const params = new URLSearchParams({
                    groupBy: mode,
                    startYear: String(startYear),
                    endYear: String(endYear),
                    programStudyId,
                });
                const response = await fetch(`/api/admin/statistics/gabungan?${params}`, {
                    signal: controller.signal,
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Gagal mengambil data statistik gabungan");
                setData(result);
                if (result.availableYears) setAvailableYears(result.availableYears);
            } catch (fetchError) {
                if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
                setError(fetchError instanceof Error ? fetchError.message : "Terjadi kesalahan");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        fetchData();
        return () => controller.abort();
    }, [mode, startYear, endYear, programStudyId]);

    // Notify parent when filter changes so donut charts can be synced
    useEffect(() => {
        onFilterChange?.({ mode, startYear, endYear, programStudyId });
    }, [mode, startYear, endYear, programStudyId]); // eslint-disable-line react-hooks/exhaustive-deps

    const formattedData = useMemo(() => {
        if (!data || !data.labels) return [];
        return data.labels.map((label, index) => {
            return {
                name: mode === "tahun" ? `Tahun ${label}` : label,
                shortName: label,
                tugasAkhir: data.series.tugasAkhir[index] ?? 0,
                artikelJurnal: data.series.artikelJurnal[index] ?? 0,
                laporanPi: data.series.laporanPi[index] ?? 0,
                laporanPlk: data.series.laporanPlk[index] ?? 0,
            };
        });
    }, [data, mode]);

    const yearOptions = Array.from(
        { length: availableYears.max - availableYears.min + 1 },
        (_, index) => availableYears.min + index
    );

    return (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <h2 className="text-sm sm:text-base font-bold text-slate-900">Statistik Karya & Laporan Repository</h2>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                        Visualisasi gabungan Tugas Akhir, Artikel Jurnal, Laporan PI, dan PLK
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex overflow-hidden rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                        {(["tahun", "prodi"] as const).map((value) => (
                            <button
                                key={value}
                                onClick={() => setMode(value)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                                    mode === value ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {value === "tahun" ? "Per Tahun" : "Per Program Studi"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
                        <Filter className="w-3 h-3 text-blue-600" />
                        <select
                            value={programStudyId}
                            onChange={(event) => setProgramStudyId(event.target.value)}
                            className="bg-transparent font-semibold text-slate-900 outline-none cursor-pointer text-xs"
                        >
                            <option value="all">Semua Program Studi</option>
                            {programStudyOptions.map((ps) => (
                                <option key={ps.id} value={ps.id}>
                                    {ps.degree} {ps.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {mode === "tahun" && (
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">Dari:</span>
                            <select
                                value={startYear}
                                onChange={(event) => setStartYear(Number(event.target.value))}
                                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer text-xs"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <span className="text-slate-400">s/d</span>
                            <select
                                value={endYear}
                                onChange={(event) => setEndYear(Number(event.target.value))}
                                className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer text-xs"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-600">
                    {SERIES.map((series) => (
                        <span key={series.key} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: series.fill }} />
                            {series.label}
                        </span>
                    ))}
                </div>
            </div>

            {loading && <div className="mt-6 h-56 animate-pulse rounded-xl bg-slate-100" />}
            {!loading && error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">{error}</div>}
            {!loading && !error && data && (
                <>
                    <div className="mt-5 h-60 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: "#64748B" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                                <Tooltip wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }} content={<CustomBarTooltip />} />
                                <Bar dataKey="tugasAkhir" name="Tugas Akhir" fill="#2563EB" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="artikelJurnal" name="Artikel Jurnal" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="laporanPi" name="Laporan PI" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="laporanPlk" name="Laporan PLK" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {(data.catatan || data.lpiTotal !== undefined) && (
                        <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
                            {mode === "prodi" && data.lpiTotal !== undefined && (
                                <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                                    Total LPI Semua Prodi: {data.lpiTotal}
                                </span>
                            )}
                            {data.catatan}
                        </p>
                    )}
                </>
            )}
        </section>
    );
}