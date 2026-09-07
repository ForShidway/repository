"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { FileText, GraduationCap, Users, Building2, Globe2 } from "lucide-react";

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
    name : string;
    judul: string;
    tahun: number;
    programStudy: {
        name: string;
        degree: string;
    } | null;
    mahasiswa: Mahasiswa[];
}

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
    distribusiProgramStudy: ProgramStudyStat[];
    distribusiArtikelProgramStudy: ProgramStudyStat[];
    tugasAkhirTerbaru: TugasAkhirTerbaru[];
    artikelJurnalTerbaru: ArtikelJurnalTerbaru[];
    aktivitasTerbaru: Aktivitas[];
};

export default function AdminDashboard() {
    const [data, setData] =
        useState<DashboardData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [page, setPage] = useState(1);
    const [articlePage, setArticlePage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const response = await fetch(
                    "/api/admin/statistics"
                );

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";

                let result: (DashboardData & { message?: string }) | null = null;

                if (contentType.includes("application/json")) {
                    result = await response.json();
                } else {
                    const text = await response.text();
                    throw new Error(
                        text.includes("<")
                            ? "Endpoint statistik tidak ditemukan atau server gagal merespons."
                            : text || "Gagal mengambil data dashboard"
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                            "Gagal mengambil data dashboard"
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

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="animate-pulse">
                        <div className="h-8 w-56 rounded bg-slate-200" />
                        <div className="mt-3 h-4 w-80 rounded bg-slate-200" />

                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                            {[1, 2, 3, 4, 5].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-32 rounded-2xl bg-white"
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="min-h-screen bg-slate-50 p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <h2 className="font-semibold text-red-700">
                            Gagal memuat dashboard
                        </h2>

                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    const formatMahasiswa = (mahasiswa: Mahasiswa[] = []) => {
        if (!mahasiswa.length) return "-";
        return mahasiswa.map((m) => `${m.name} (${m.nim})`).join(", ");
    };

    return (
        <main className="min-h-screen bg-[#F4F9F9] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl p-6 lg:p-8">

                <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                            Repository Otomotif
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            Beranda Admin
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Kelola seluruh
                            aktivitas repository otomotif.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs text-slate-400">
                            Tahun Akademik
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                            {new Date().getFullYear()}
                        </p>
                    </div>
                </section>

                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={<FileText className="h-5 w-5" />}
                        label="Tugas Akhir"
                        value={data.summary.totalTugasAkhir}
                        description="Total terdaftar"
                        iconClass="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        icon={<GraduationCap className="h-5 w-5" />}
                        label="Dosen"
                        value={data.summary.totalDosen}
                        description="Total dosen"
                        iconClass="bg-emerald-50 text-emerald-600"
                    />
                    <StatCard
                        icon={<Users className="h-5 w-5" />}
                        label="Mahasiswa"
                        value={data.summary.totalMahasiswa}
                        description="Memiliki TA"
                        iconClass="bg-violet-50 text-violet-600"
                    />
                    <StatCard
                        icon={<Building2 className="h-5 w-5" />}
                        label="Ruangan"
                        value={data.summary.totalRuangan}
                        description="Ruangan terdaftar"
                        iconClass="bg-orange-50 text-orange-600"
                    />
                    <StatCard
                        icon={<Globe2 className="h-5 w-5" />}
                        label="SDGs"
                        value={data.summary.totalSDGs}
                        description="SDGs aktif"
                        iconClass="bg-cyan-50 text-cyan-600"
                    />
                    <StatCard
                        icon={<Globe2 className="h-5 w-5" />}
                        label="Artikel Jurnal"
                        value={data.summary.totalArtikelJurnal}
                        description="Artikel Tersedia"
                        iconClass="bg-cyan-50 text-cyan-600"
                    />
                    <StatCard
                        icon={<Globe2 className="h-5 w-5" />}
                        label="LPI"
                        value={data.summary.totalLaporanPi}
                        description="Artikel Tersedia"
                        iconClass="bg-cyan-50 text-cyan-600"
                    />
                </section>

                <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Grafik Tugas Akhir
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Jumlah Tugas Akhir per tahun
                                </p>
                            </div>
                            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                Per Tahun
                            </span>
                        </div>
                        <div className="mt-8">
                            <YearChart 
                                data={ data.tugasPerTahun }
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Distribusi Berdasarkan Program Studi
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Top Program Studi
                            </p>
                        </div>
                        {data.distribusiProgramStudy.length === 0 ? (
                            <div className="mt-6">
                                <EmptyState text="Belum ada data program studi." />
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <DonutChart
                                    data={data.distribusiProgramStudy.slice(0, 5)}
                                    total={data.summary.totalTugasAkhir}
                                />
                                <DistributionLegend
                                    data={data.distribusiProgramStudy.slice(0, 5)}
                                    total={data.summary.totalTugasAkhir}
                                />
                            </div>
                        )}
                    </div>
                </section>

                <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Grafik Artikel Jurnal</h2>
                                <p className="mt-1 text-sm text-slate-500">Jumlah artikel jurnal per tahun</p>
                            </div>
                            <span className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">Per Tahun</span>
                        </div>
                        <div className="mt-8">
                            <YearChart data={data.artikelPerTahun} label="Artikel" color="bg-cyan-500" hoverColor="group-hover:bg-cyan-600" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Distribusi Artikel Jurnal</h2>
                            <p className="mt-1 text-sm text-slate-500">Berdasarkan program studi</p>
                        </div>
                        {data.distribusiArtikelProgramStudy.length === 0 ? (
                            <div className="mt-6">
                                <EmptyState text="Belum ada data artikel jurnal." />
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <DonutChart
                                    data={data.distribusiArtikelProgramStudy.slice(0, 5)}
                                    total={data.summary.totalArtikelJurnal}
                                    itemLabel="Artikel"
                                    totalLabel="Total Artikel"
                                />
                                <DistributionLegend
                                    data={data.distribusiArtikelProgramStudy.slice(0, 5)}
                                    total={data.summary.totalArtikelJurnal}
                                />
                            </div>
                        )}
                    </div>
                </section>

                <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Grafik Laporan PI</h2>
                                <p className="mt-1 text-sm text-slate-500">Jumlah laporan PI per tahun mulai</p>
                            </div>
                            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Per Tahun</span>
                        </div>
                        <div className="mt-8">
                            <YearChart data={data.laporanPiPerTahun} label="Laporan PI" color="bg-emerald-500" hoverColor="group-hover:bg-emerald-600" />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Distribusi Laporan PI</h2>
                            <p className="mt-1 text-sm text-slate-500">Berdasarkan tahun mulai</p>
                        </div>
                        {data.laporanPiPerTahun.every((item) => item.jumlah === 0) ? (
                            <div className="mt-6">
                                <EmptyState text="Belum ada data laporan PI." />
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <DonutChart
                                    data={data.laporanPiPerTahun
                                        .filter((item) => item.jumlah > 0)
                                        .map((item) => ({
                                            id: item.tahun,
                                            name: String(item.tahun),
                                            degree: "Tahun mulai",
                                            jumlah: item.jumlah,
                                        }))}
                                    total={data.summary.totalLaporanPi}
                                    itemLabel="Laporan PI"
                                    totalLabel="Total Laporan PI"
                                />
                                <DistributionLegend
                                    data={data.laporanPiPerTahun
                                        .filter((item) => item.jumlah > 0)
                                        .map((item) => ({
                                            id: item.tahun,
                                            name: String(item.tahun),
                                            degree: "Tahun mulai",
                                            jumlah: item.jumlah,
                                        }))}
                                    total={data.summary.totalLaporanPi}
                                />
                            </div>
                        )}
                    </div>
                </section>

                <section className="mt-6">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Tugas Akhir Terbaru
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {data.tugasAkhirTerbaru.length} Tugas Akhir ditemukan
                                </p>
                            </div>
                            <Link href="/admin/tugas-akhirs"
                                className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-400">No.</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-400">Judul Tugas Akhir</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-400">Mahasiswa</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-400">Tahun</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-400">Program Studi</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-400">Pembimbing</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.tugasAkhirTerbaru .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)  .map((ta, index) => (
                                        <tr key={ta.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50" >
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="max-w-[280px] px-4 py-4">
                                                <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                                                    {ta.judul}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {formatMahasiswa(ta.mahasiswa)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {ta.tahunMasuk}
                                            </td>
                                            <td className="px-4 py-4">
                                                {ta.programStudy ? (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-700">
                                                            {ta.programStudy.degree}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {ta.programStudy.name}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {ta.pembimbing?.name || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {data.tugasAkhirTerbaru.length === 0 && (
                            <div className="p-8">
                                <EmptyState text="Belum ada Tugas Akhir." />
                            </div>
                        )}
                        
                        {data.tugasAkhirTerbaru.length > ITEMS_PER_PAGE && (
                            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-6 py-5">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Kembali
                                </button>

                                {Array.from( 
                                    { length: Math.ceil(data.tugasAkhirTerbaru.length / ITEMS_PER_PAGE) },  (_, i) => i + 1
                                ).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                                            page === p ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}

                                <button
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(Math.ceil(data.tugasAkhirTerbaru.length / ITEMS_PER_PAGE), p + 1)
                                        )
                                    }
                                    disabled={page === Math.ceil(data.tugasAkhirTerbaru.length / ITEMS_PER_PAGE)}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Lanjut
                                </button>
                            </div>
                        )}

                    </div>
                </section>
                <section className="mt-6">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                     Artikel Jurnal Terbaru
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {data.artikelJurnalTerbaru.length} Artikel Jurnal ditemukan
                                </p>
                            </div>
                            <Link href="/admin/tugas-akhirs"
                                className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-400">No.</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-400">Judul</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-400">Mahasiswa</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-400">Tahun</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-400">Program Studi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.artikelJurnalTerbaru.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)  .map((aj, index) => (
                                        <tr key={aj.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50" >
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {(page - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="max-w-[280px] px-4 py-4">
                                                <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                                                    {aj.judul}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {aj.name}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {aj.tahun}
                                            </td>
                                            <td className="px-4 py-4">
                                                {aj.programStudy ? (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-700">
                                                            {aj.programStudy.degree}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {aj.programStudy.name}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {data.artikelJurnalTerbaru.length === 0 && (
                            <div className="p-8">
                                <EmptyState text="Belum ada Tugas Akhir." />
                            </div>
                        )}
                        
                        {data.artikelJurnalTerbaru.length > ITEMS_PER_PAGE && (
                            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-6 py-5">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Kembali
                                </button>

                                {Array.from( 
                                    { length: Math.ceil(data.artikelJurnalTerbaru.length / ITEMS_PER_PAGE) },  (_, i) => i + 1
                                ).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                                            page === p ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}

                                <button
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(Math.ceil(data.artikelJurnalTerbaru.length / ITEMS_PER_PAGE), p + 1)
                                        )
                                    }
                                    disabled={page === Math.ceil(data.artikelJurnalTerbaru.length / ITEMS_PER_PAGE)}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Lanjut
                                </button>
                            </div>
                        )}

                    </div>
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
}: {
    icon: ReactNode;
    label: string;
    value: number;
    description: string;
    iconClass: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${iconClass}`}>
                    {icon}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-slate-900">
                            {value}
                        </p>
                       
                    </div>
                     <p className="text-sm font-semibold text-slate-700"> {label}  </p>
                    {/* <p className="mt-1 text-xs text-slate-400">  {description} </p> */}
                </div>
            </div>
        </div>
    );
}

function YearChart({
    data,
    label = "TA",
    color = "bg-blue-500",
    hoverColor = "group-hover:bg-blue-600",
}: {
    data: TahunStat[];
    label?: string;
    color?: string;
    hoverColor?: string;
}) {
    const max =
        Math.max(
            ...data.map((item) => item.jumlah), 1
        );

    return (
        <div>
            <div className="flex h-64 items-end gap-3 overflow-visible border-b border-l border-slate-200 px-4 pb-0">
                {data.map((item) => {
                    const height =
                        (item.jumlah /
                            max) *
                        100;
                    return (
                        <div key={item.tahun} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                            <div className="relative flex w-full max-w-12 flex-1 items-end justify-center">

                                {/* TOOLTIP */}
                                <div className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-top-10 group-hover:opacity-100">
                                    Tahun {item.tahun}: {item.jumlah} {label}
                                    <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-slate-900" />
                                </div>

                                <div
                                    className={`w-full rounded-t-lg ${color} transition-all duration-300 ${hoverColor}`}
                                    style={{
                                        height: `${Math.max(
                                            height,
                                            3
                                        )}%`,
                                    }}
                                />
                            </div>

                            <div className="mt-3 text-xs font-medium text-slate-400">
                                {item.tahun}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const DONUT_COLORS = [
    "#3b82f6", // blue-500
    "#14b8a6", // teal-500
    "#8b5cf6", // violet-500
    "#f97316", // orange-500
    "#cbd5e1", // slate-300
];

function DonutChart({
    data,
    total,
    itemLabel = "TA",
    totalLabel = "Total TA",
}: {
    data: { id: number; name: string; degree: string; jumlah: number }[];
    total: number;
    itemLabel?: string;
    totalLabel?: string;
}) {
    const size = 200;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const activeItem = activeIndex !== null ? data[activeIndex] : null;

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={strokeWidth}
                />
                {data.map((item, index) => {
                    const percent = total > 0 ? item.jumlah / total : 0;
                    const dash = percent * circumference;
                    const gap = circumference - dash;
                    const offset = data
                        .slice(0, index)
                        .reduce((sum, previousItem) => {
                            const previousPercent = total > 0 ? previousItem.jumlah / total : 0;
                            return sum + previousPercent;
                        }, 0) * circumference;
                    const isActive = activeIndex === index;
                    const isFullCircle = percent >= 0.9999;

                    return (
                        <circle
                            key={item.id}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
                            strokeWidth={isActive ? strokeWidth + 6 : strokeWidth}
                            strokeDasharray={isFullCircle ? undefined : `${dash} ${gap}`}
                            strokeDashoffset={isFullCircle ? undefined : -offset}
                            className="cursor-pointer transition-all duration-300"
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                            onFocus={() => setActiveIndex(index)}
                            onBlur={() => setActiveIndex(null)}
                            style={{ filter: isActive ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.35))" : "none" }}
                        />
                    );
                })}
            </svg>

            {activeItem ? (
                <div className="pointer-events-none absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-center shadow-lg backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{activeItem.degree}</p>
                    <p className="mt-1 text-xs font-bold text-slate-800 line-clamp-2">{activeItem.name}</p>
                    <p className="mt-1 text-sm font-bold text-blue-600">
                        {activeItem.jumlah} {itemLabel}
                        <span className="ml-1 text-xs font-medium text-slate-500">
                            ({total > 0 ? Math.round((activeItem.jumlah / total) * 100) : 0}%)
                        </span>
                    </p>
                </div>
            ) : (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-slate-900">{total}</p>
                    <p className="text-xs text-slate-400">{totalLabel}</p>
                </div>
            )}
        </div>
    );
}

function DistributionLegend({
    data,
    total,
}: {
    data: { id: number; name: string; degree: string; jumlah: number }[];
    total: number;
}) {
    return (
        <div className="w-full space-y-3 sm:w-auto">
            {data.map((item, index) => {
                const percentage = total > 0 ? Math.round((item.jumlah / total) * 100) : 0;
                return (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                        />
                        <span className="text-slate-600">{item.name}</span>
                        <span className="ml-auto font-semibold text-slate-900">
                            {item.jumlah} ({percentage}%)
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function ProgramBar({
    name,
    degree,
    jumlah,
    total,
}: {
    name: string;
    degree: string;
    jumlah: number;
    total: number;
}) {
    const percentage =
        total > 0
            ? Math.round(
                  (jumlah / total) *
                      100
              )
            : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-700">  {degree} </p>
                    <p className="truncate text-xs text-slate-400">  {name} </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">  {jumlah} </span>
                    <span className="text-xs text-slate-400"> ({percentage}%) </span>
                </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

function ActivityItem({
    activity,
    last,
}: {
    activity: Aktivitas;
    last: boolean;
}) {
    const date = new Date(
        activity.createdAt
    );

    const time = date.toLocaleString(
        "id-ID",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

    const mahasiswaText = activity.mahasiswa.length
        ? activity.mahasiswa
              .map((m) => `${m.name} (${m.nim})`)
              .join(", ")
        : "-";

    return (
        <div className="relative flex gap-4">
            {!last && (
                <div className="absolute left-4 top-9 h-full w-px bg-slate-200" />
            )}
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm text-blue-600">  + </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                    Tugas Akhir baru
                    ditambahkan
                </p>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">  {activity.judul} </p>
                <p className="mt-1 text-[11px] text-slate-400"> {mahasiswaText} •{" "} {time} </p>
            </div>
        </div>
    );
}
function EmptyState({
    text,
}: {
    text: string;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-400"> {text} </p>
        </div>
    );
}
