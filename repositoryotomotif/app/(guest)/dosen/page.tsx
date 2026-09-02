"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Dosen = {
    id: number;
    name: string;
};

const PER_PAGE = 10;

export default function DosenPage() {
    const router = useRouter();

    const [dosens, setDosens] = useState<Dosen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [kataKunci, setKataKunci] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function fetchDosens() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/dosens");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Gagal mengambil data dosen"
                    );
                }

                setDosens(data);
            } catch (error) {
                console.error(error);
                setError(
                    error instanceof Error ? error.message : "Terjadi kesalahan"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchDosens();
    }, []);

    const filtered = useMemo(() => {
        if (!kataKunci) return dosens;
        const lq = kataKunci.toLowerCase();
        return dosens.filter((d) => d.name.toLowerCase().includes(lq));
    }, [dosens, kataKunci]);

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <main className="min-h-screen bg-[#F4F9F9] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <section className="mb-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
                        Repository Otomotif
                    </p>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Dosen Pembimbing
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Lihat statistik bimbingan dan Tugas Akhir yang pernah
                        dibimbing oleh dosen.
                    </p>
                </section>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* SEARCH */}
                <div className="mb-4">
                    <div className="relative max-w-sm">
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            value={kataKunci}
                            onChange={(e) => {
                                setKataKunci(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Cari nama dosen..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <p className="text-sm text-slate-500">Memuat daftar dosen...</p>
                    </div>
                )}

                {/* EMPTY */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <p className="font-medium text-slate-700">
                            {kataKunci
                                ? "Tidak ada dosen yang cocok dengan pencarian."
                                : "Belum ada data dosen."}
                        </p>
                    </div>
                )}

                {/* TABLE */}
                {!loading && paged.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left user">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="w-16 px-6 py-3 text-16 font-bold uppercase tracking-wider text-black">
                                        No
                                    </th>
                                    <th className="px-6 py-3 text-16 font-bold uppercase tracking-wider text-black">
                                        Nama Dosen
                                    </th>
                                    <th className="w-40 px-6 py-3 text-right text-16 font-bold uppercase tracking-wider text-slate-500">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map((dosen, idx) => (
                                    <tr
                                        key={dosen.id}
                                        onClick={() => router.push(`/dosen/${dosen.id}`)}
                                        className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-blue-50/40"
                                    >
                                        <td className="px-6 py-4 text-sm text-black font-bold">
                                            {(page - 1) * PER_PAGE + idx + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-slate-900">
                                                    {dosen.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                                Lihat Statistik
                                                <span>→</span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                        >
                            Kembali
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                    page === p
                                        ? "bg-blue-600 text-white"
                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
                        >
                            Lanjut
                        </button>
                    </div>
                )}

            </div>
        </main>
    );
}