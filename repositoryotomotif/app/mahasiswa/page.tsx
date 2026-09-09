"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
    description: string | null;
};

const degreeConfig: Record<string, { gradient: string; badge: string; icon: string }> = {
    s1: {
        gradient: "from-blue-500 to-blue-700",
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
        icon: "",
    },
    d3: {
        gradient: "from-indigo-500 to-indigo-700",
        badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
        icon: "",
    },
    d4: {
        gradient: "from-violet-500 to-violet-700",
        badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
        icon: "",
    },
};

function getDegreeConfig(degree: string) {
    const key = degree.toLowerCase();
    return degreeConfig[key] ?? {
        gradient: "from-slate-500 to-slate-700",
        badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
        icon: "📋",
    };
}

export default function MahasiswaPage() {
    const router = useRouter();
    const [programStudies, setProgramStuies] = useState<ProgramStudy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProgramStudies() {
            try {
                setError("");
                const response = await fetch("/api/program-studies");
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Gagal mengambil data program studi")
                }
                setProgramStuies(data);
            } catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchProgramStudies();
    }, []);

    function handleSelectProgramStudy(programStudyId: number) {
        router.push(`/mahasiswa/${programStudyId}`);
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f8fafc] px-6 py-10">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-10">
                        <div className="skeleton mb-3 h-4 w-32 rounded" />
                        <div className="skeleton mb-2 h-8 w-56 rounded" />
                        <div className="skeleton h-4 w-96 rounded" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {[1, 2].map(i => <div key={i} className="skeleton h-44 rounded-2xl" />)}
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <section className="mb-10">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Repositori Otomotif</p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Pilih Program Studi</h1>
                    <p className="mt-2 max-w-2xl text-slate-500">
                        Pilih program studi untuk melanjutkan pengisian data tugas mahasiswa.
                    </p>
                </section>

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <svg className="mt-0.5 shrink-0 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                )}

                {!error && programStudies.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                            📋
                        </div>
                        <p className="font-bold text-slate-700">Belum ada Program Studi</p>
                        <p className="mt-1 text-sm text-slate-400">Data program studi belum tersedia.</p>
                    </div>
                )}

                <section className="grid gap-5 md:grid-cols-2">
                    {programStudies.map((programStudy) => {
                        const cfg = getDegreeConfig(programStudy.degree);
                        return (
                            <button
                                key={programStudy.id}
                                type="button"
                                onClick={() => handleSelectProgramStudy(programStudy.id)}
                                className="group text-left"
                            >
                                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-xl">
                                    {/* Top gradient accent */}
                                    <span className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${cfg.gradient}`} />

                                    {/* Degree badge + arrow */}
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{cfg.icon}</span>
                                            <span className={`rounded-lg px-3 py-1.5 text-sm font-bold ${cfg.badge}`}>
                                                {programStudy.degree.toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>

                                    {/* Program name */}
                                    <h2 className="text-lg font-extrabold leading-tight text-slate-900">
                                        {programStudy.name}
                                    </h2>

                                    {programStudy.description && (
                                        <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2">
                                            {programStudy.description}
                                        </p>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-sm font-semibold text-slate-500">
                                            Lanjut Mengisi Data
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 opacity-0 transition group-hover:opacity-100">
                                            Pilih →
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </section>
            </div>
        </main>
    )
}