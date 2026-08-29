"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Dosen = {
    id: number;
    name: string;
};

export default function DosenPage() {
    const router = useRouter();

    const [dosens, setDosens] =
        useState<Dosen[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        async function fetchDosens() {
            try {
                setLoading(true);
                setError("");

                const response =
                    await fetch("/api/dosens");

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Gagal mengambil data dosen"
                    );
                }

                setDosens(data);
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

        fetchDosens();
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-8">
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}

                <section className="mb-10">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-blue-600">
                        Repository Otomotif
                    </p>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Dosen Pembimbing
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Lihat statistik bimbingan dan
                        Tugas Akhir yang pernah dibimbing
                        oleh dosen.
                    </p>
                </section>

                {/* ERROR */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {/* LOADING */}

                {loading && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <p className="text-sm text-slate-500">
                            Memuat daftar dosen...
                        </p>
                    </div>
                )}

                {/* EMPTY */}

                {!loading &&
                    !error &&
                    dosens.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                            <p className="font-medium text-slate-700">
                                Belum ada data dosen.
                            </p>
                        </div>
                    )}

                {/* DOSEN */}

                {!loading &&
                    dosens.length > 0 && (
                        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {dosens.map((dosen) => (
                                <button
                                    key={dosen.id}
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/dosen/${dosen.id}`
                                        )
                                    }
                                    className="group text-left"
                                >
                                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">

                                        <div className="flex items-center gap-4">

                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 ring-4 ring-blue-50">
                                                {dosen.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="truncate text-lg font-bold text-slate-900">
                                                    {
                                                        dosen.name
                                                    }
                                                </h2>

                                                <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    Dosen Pembimbing
                                                </span>
                                            </div>

                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                            <span className="text-sm font-semibold text-blue-600">
                                                Lihat Statistik
                                            </span>

                                            <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                                                →
                                            </span>
                                        </div>

                                    </div>
                                </button>
                            ))}

                        </section>
                    )}

            </div>
        </main>
    );
}