"use client";

import { useEffect, useMemo, useState } from "react";

type ProgramStudyOption = {
    id: number;
    name: string;
    degree: string;
};

type StatistikResponse = {
    labels: string[];
    series: {
        tugasAkhir: number[];
        artikelJurnal: number[];
        laporanPi: number[];
    };
    availableYears?: { min: number; max: number };
    lpiTotal?: number;
    catatan?: string;
};

const SERIES = [
    { key: "tugasAkhir", label: "Tugas Akhir", bar: "bg-blue-500", dot: "#3b82f6" },
    { key: "artikelJurnal", label: "Artikel Jurnal", bar: "bg-cyan-500", dot: "#06b6d4" },
    { key: "laporanPi", label: "Laporan PI", bar: "bg-emerald-500", dot: "#10b981" },
] as const;

export default function StatistikDashboard({
    programStudyOptions,
}: {
    programStudyOptions: ProgramStudyOption[];
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

    const max = useMemo(() => {
        if (!data) return 1;
        return Math.max(...SERIES.flatMap(({ key }) => data.series[key]), 1);
    }, [data]);

    const yearOptions = Array.from(
        { length: availableYears.max - availableYears.min + 1 },
        (_, index) => availableYears.min + index
    );

    return (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Statistik Tugas</h2>
                    <p className="mt-1 text-sm text-slate-500">Tugas Akhir, Artikel Jurnal, dan Laporan PI dalam satu grafik</p>
                </div>
                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                    {(["tahun", "prodi"] as const).map((value) => (
                        <button
                            key={value}
                            onClick={() => setMode(value)}
                            className={`px-3 py-2 text-xs font-semibold transition ${mode === value ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                        >
                            {value === "tahun" ? "Per Tahun" : "Per Program Studi"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <select value={programStudyId} onChange={(event) => setProgramStudyId(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <option value="all">Semua Program Studi</option>
                    {programStudyOptions.map((programStudy) => (
                        <option key={programStudy.id} value={programStudy.id}>{programStudy.degree} {programStudy.name}</option>
                    ))}
                </select>
                {mode === "tahun" && (
                    <>
                        <select value={startYear} onChange={(event) => setStartYear(Number(event.target.value))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <span className="text-sm text-slate-400">sampai</span>
                        <select value={endYear} onChange={(event) => setEndYear(Number(event.target.value))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <button onClick={() => { setStartYear(availableYears.min); setEndYear(availableYears.max); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Semua Tahun</button>
                    </>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                {SERIES.map((series) => <span key={series.key} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: series.dot }} />{series.label}</span>)}
            </div>

            {loading && <div className="mt-8 h-56 animate-pulse rounded-xl bg-slate-100" />}
            {!loading && error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
            {!loading && !error && data && (
                <>
                    <div className="mt-8 flex h-64 items-end gap-4 overflow-x-auto border-b border-l border-slate-200 px-2">
                        {data.labels.map((label, index) => (
                            <div key={label} className="group relative flex h-full min-w-[64px] flex-1 flex-col items-center justify-end">
                                <div className="pointer-events-none absolute left-1/2 top-2 z-20 w-48 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-300">
                                        {mode === "tahun" ? `Tahun ${label}` : label}
                                    </p>
                                    {SERIES.map((series) => (
                                        <p key={series.key} className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: series.dot }} />
                                            {series.label}: {data.series[series.key][index] ?? 0}
                                        </p>
                                    ))}
                                    <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-900" />
                                </div>
                                <div className="flex h-full w-full items-end justify-center gap-1">
                                    {SERIES.map((series) => {
                                        const value = data.series[series.key][index] ?? 0;
                                        const height = (value / max) * 100;
                                        return <div key={series.key} className="flex h-full w-4 items-end"><div className={`w-full rounded-t-sm ${series.bar} transition-all duration-300`} style={{ height: `${Math.max(height, value > 0 ? 3 : 0)}%` }} /></div>;
                                    })}
                                </div>
                                <div className="mt-3 line-clamp-1 max-w-[100px] text-center text-[11px] font-medium text-slate-400">{label}</div>
                            </div>
                        ))}
                    </div>
                    {(data.catatan || data.lpiTotal !== undefined) && <p className="mt-4 text-xs text-slate-400">{mode === "prodi" && data.lpiTotal !== undefined && <span className="mr-2 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-500">LPI: semua prodi ({data.lpiTotal})</span>}{data.catatan}</p>}
                </>
            )}
        </section>
    );
}