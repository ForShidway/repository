"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    FileText,
    Briefcase,
    GraduationCap,
    Sparkles,
    CheckCircle2,
    Info,
    ArrowRight,
    Upload,
    ShieldCheck,
    HelpCircle,
    FolderOpen,
    AlertCircle,
    UserCircle2,
} from "lucide-react";

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
    description: string | null;
};

type UserSession = {
    id: string | number;
    email: string;
    name: string;
    role: string;
};

const degreeConfig: Record<string, { gradient: string; badge: string; icon: string }> = {
    s1: {
        gradient: "from-blue-500 to-blue-700",
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
        icon: "🎓",
    },
    d3: {
        gradient: "from-emerald-500 to-emerald-700",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        icon: "🛠️",
    },
    d4: {
        gradient: "from-violet-500 to-violet-700",
        badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
        icon: "⚡",
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
    const [user, setUser] = useState<UserSession | null>(null);
    const [programStudies, setProgramStudies] = useState<ProgramStudy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"ta" | "jurnal" | "pi" | "plk">("ta");

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            try {
                // Fetch dynamic session & program studies directly from DB API
                const [sessionRes, prodiRes] = await Promise.all([
                    fetch("/api/auth/session", { cache: "no-store" }),
                    fetch("/api/program-studies"),
                ]);

                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    setUser(sessionData.user ?? null);
                }

                if (prodiRes.ok) {
                    const prodiData = await prodiRes.json();
                    setProgramStudies(prodiData);
                }
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Terjadi kesalahan memuat data dashboard");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 p-6 lg:p-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-20 w-80 rounded-2xl bg-slate-200" />
                        <div className="grid gap-6 md:grid-cols-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-44 rounded-2xl bg-white shadow-xs" />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] pb-16 pt-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-10">

                {/* 1. HEADER (BEBAS TANPA KOTAK GELAP / LEBIH ELEGANKAN DI ATAS HALAMAN) */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-200/80">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                            Selamat Datang, {user?.name || "Mahasiswa"} 👋
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Pilih program studi Anda untuk mengisi, mengelola, dan mengunggah berkas karya mahasiswa.
                        </p>
                    </div>

                    
                </header>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                        {error}
                    </div>
                )}

                {/* 2. ALUR & TAHAPAN PENGUNGGAHAN DOKUMEN (FAVORIT USER) */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-blue-600" />
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Alur & Tahapan Pengunggahan Dokumen</h2>
                                <p className="text-xs text-slate-500">Panduan 4 langkah mudah penyerahan berkas repositori karya mahasiswa</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                        {/* Step 1 */}
                        <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 hover:bg-white hover:border-blue-300 hover:shadow-md transition">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-extrabold text-white">
                                1
                            </span>
                            <h3 className="text-xs font-bold text-slate-900">Pilih Program Studi</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Pilih program studi Anda dari kartu yang tersedia di bawah ini.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 hover:bg-white hover:border-blue-300 hover:shadow-md transition">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-extrabold text-white">
                                2
                            </span>
                            <h3 className="text-xs font-bold text-slate-900">Pilih Folder Karya</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Tentukan jenis dokumen: Tugas Akhir, Artikel Jurnal, Laporan PI, atau PLK.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 hover:bg-white hover:border-blue-300 hover:shadow-md transition">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-extrabold text-white">
                                3
                            </span>
                            <h3 className="text-xs font-bold text-slate-900">Lengkapi Form Metadata</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Isikan Judul, Nama Mahasiswa, NIM, Pembimbing, Abstrak, dan Tagging SDGs.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 hover:bg-white hover:border-emerald-300 hover:shadow-md transition">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-extrabold text-white">
                                4
                            </span>
                            <h3 className="text-xs font-bold text-slate-900">Unggah Berkas PDF</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Lampirkan dokumen PDF lengkap, lalu simpan untuk menerbitkan berkas.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. FOLDER PROGRAM STUDI (DESAIN TERFAVORIT - DINAMIS TERHUBUNG DENGAN DATABASE ADMIN) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900">Pilih Program Studi</h2>
                            <p className="text-xs text-slate-500">
                                Pilih program studi untuk melanjutkan pengisian data tugas mahasiswa. (Tersambung langsung dengan data Program Studi dari Admin)
                            </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                            <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                            {programStudies.length} Program Studi Aktif
                        </span>
                    </div>

                    {!error && programStudies.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                                📋
                            </div>
                            <p className="font-bold text-slate-700">Belum ada Program Studi</p>
                            <p className="mt-1 text-xs text-slate-400">Data program studi dari admin belum tersedia.</p>
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {programStudies.map((programStudy) => {
                            const cfg = getDegreeConfig(programStudy.degree);
                            return (
                                <button
                                    key={programStudy.id}
                                    type="button"
                                    onClick={() => router.push(`/mahasiswa/${programStudy.id}`)}
                                    className="group text-left focus:outline-none"
                                >
                                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-xl">
                                        {/* Top gradient accent */}
                                        <span className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${cfg.gradient}`} />

                                        {/* Degree badge + arrow */}
                                        <div className="mb-5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{cfg.icon}</span>
                                                <span className={`rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide ${cfg.badge}`}>
                                                    {programStudy.degree.toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        </div>

                                        {/* Program name */}
                                        <h2 className="text-lg font-extrabold leading-tight text-slate-900 group-hover:text-blue-600 transition">
                                            {programStudy.name}
                                        </h2>

                                        {programStudy.description ? (
                                            <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
                                                {programStudy.description}
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-xs text-slate-400 italic">
                                                Departemen Teknik Otomotif FT UNP
                                            </p>
                                        )}

                                        {/* Footer */}
                                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                            <span className="text-xs font-semibold text-slate-500">
                                                Lanjut Mengisi Data
                                            </span>
                                            <span className="text-xs font-bold text-blue-600 opacity-0 transition group-hover:opacity-100">
                                                Pilih Folder →
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>
        </main>
    );
}