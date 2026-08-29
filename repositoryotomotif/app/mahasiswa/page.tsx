"use client";

import { useEffect, useState } from "react";
import { useRouter} from "next/navigation";

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
    description: string | null;
};

export default function MahasiswaPage() {
    const router = useRouter();
    const [programStudies, setProgramStuies] = useState<ProgramStudy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect (() => {
        async function fetchProgramStudies() {
            try {
                setError("");
                const response = await fetch("/api/program-studies");
                const data = await response.json();
                if(!response.ok) {
                    throw new Error( data.message || "Gagal mengambil data program studi")
                }
                setProgramStuies(data);
            } catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Terjadi kesalahan");
            } finally {
                setLoading (false);
            }
        }
        fetchProgramStudies();
    }, []);

    function handleSelectProgramStudy(programStudyId: number){
        router.push(`/mahasiswa/${programStudyId}`);
    }
    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-6xl">
                    <p>Memuat Program Studi....</p>
                </div>
            </main>
        )
    }
    return (
        <main className="min-h-screen bg-gray-50 px-8">
            <div className="mx-auto max-w-6xl">
                <section className="mb-10">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">Repositori Otomotif</p>
                    <h1 className="mt-3 max-w-3xl font-bold text-slate-900">Pilih Program Study</h1>
                    <p className="mt-3 max-w-2xl text-slate-600">piilh program studi utnuk melanjutkan pengisian tugas mahasiswa</p>
                </section>
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="text-sm text-red-600">  {error}  </p>
                    </div>
                )}
                {!error && programStudies.length === 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <p>Belum ada Program studi yang tersedia</p>
                    </div>
                )}
                <section className="grid gap-6 md:grid-cols-2">
                    {programStudies.map((programStudy) => (
                        <button key={programStudy.id} type="button" onClick={() => handleSelectProgramStudy(programStudy.id)} className="group text-left">
                            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                                <div className="mb-6 flex items-center justify-between">
                                    <span className="rounded-lg bg-blue-50 px-3  py-2 text-sm font-bold text-blue-700">
                                        {programStudy.degree}
                                    </span>
                                    <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                                        →
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{programStudy.name}</h2>
                                {programStudy.description && (
                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{programStudy.description}</p>
                                )}
                                <div className="mt-7 border-t border-slate-100 pt-5">
                                    <span className="text-sm font-semibold text-blue-600">Pilih Program Study</span>
                                </div>
                            </div>    
                        </button>
                    ))}
                </section>
            </div>
        </main>
    )
}