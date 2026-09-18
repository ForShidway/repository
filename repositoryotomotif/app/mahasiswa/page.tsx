"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    GraduationCap,
    Wrench,
    Zap,
    Layers,
    ArrowRight,
    Upload,
    FolderOpen,
    CheckCircle2,
    Sparkles,
    ChevronRight,
    MousePointerClick,
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

type DegreeStyleConfig = {
    gradient: string;
    badge: string;
    iconBg: string;
    borderHover: string;
    glowBg: string;
    degreeLabel: string;
    Icon: React.ComponentType<{ className?: string }>;
};

const degreeConfig: Record<string, DegreeStyleConfig> = {
    s1: {
        gradient: "from-blue-600 via-indigo-600 to-blue-700",
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/80",
        iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25",
        borderHover: "hover:border-blue-400 hover:shadow-blue-500/10",
        glowBg: "from-blue-500/10 to-indigo-500/5",
        degreeLabel: "Sarjana (S1)",
        Icon: GraduationCap,
    },
    d3: {
        gradient: "from-emerald-600 via-teal-600 to-emerald-700",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
        iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25",
        borderHover: "hover:border-emerald-400 hover:shadow-emerald-500/10",
        glowBg: "from-emerald-500/10 to-teal-500/5",
        degreeLabel: "Diploma III (D3)",
        Icon: Wrench,
    },
    d4: {
        gradient: "from-violet-600 via-purple-600 to-violet-700",
        badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/80",
        iconBg: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/25",
        borderHover: "hover:border-violet-400 hover:shadow-violet-500/10",
        glowBg: "from-violet-500/10 to-purple-500/5",
        degreeLabel: "Sarjana Terapan (D4)",
        Icon: Zap,
    },
    s2: {
        gradient: "from-amber-600 via-orange-600 to-amber-700",
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
        iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25",
        borderHover: "hover:border-amber-400 hover:shadow-amber-500/10",
        glowBg: "from-amber-500/10 to-orange-500/5",
        degreeLabel: "Magister (S2)",
        Icon: Layers,
    },
};

function getDegreeConfig(degree: string): DegreeStyleConfig {
    const key = (degree || "").toLowerCase().trim();
    return degreeConfig[key] ?? {
        gradient: "from-slate-600 via-slate-700 to-slate-800",
        badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
        iconBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-slate-500/25",
        borderHover: "hover:border-slate-400 hover:shadow-slate-500/10",
        glowBg: "from-slate-500/10 to-slate-500/5",
        degreeLabel: (degree || "PRODI").toUpperCase(),
        Icon: BookOpen,
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
                <section className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-extrabold text-slate-900">Pilih Program Studi</h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200">
                                    <MousePointerClick className="h-3 w-3" />
                                    Klik untuk memilih
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pilih program studi Anda untuk melanjutkan ke pengisian dokumen dan berkas karya mahasiswa.
                            </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-slate-600 bg-white border border-slate-200 shadow-2xs px-3.5 py-1.5 rounded-xl">
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                            {programStudies.length} Program Studi Aktif
                        </span>
                    </div>

                    {!error && programStudies.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <BookOpen className="h-7 w-7" />
                            </div>
                            <p className="font-bold text-slate-800">Belum ada Program Studi</p>
                            <p className="mt-1 text-xs text-slate-400">Data program studi dari admin belum tersedia.</p>
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        {programStudies.map((programStudy) => {
                            const cfg = getDegreeConfig(programStudy.degree);
                            const IconComponent = cfg.Icon;
                            return (
                                <button
                                    key={programStudy.id}
                                    type="button"
                                    onClick={() => router.push(`/mahasiswa/${programStudy.id}`)}
                                    className={`group relative text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl`}
                                >
                                    <div className={`relative overflow-hidden rounded-2xl border-2 border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-xl active:scale-[0.99] cursor-pointer ${cfg.borderHover}`}>
                                        {/* Top gradient accent line */}
                                        <span className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${cfg.gradient}`} />

                                        {/* Subtle corner glow effect on hover */}
                                        <div className={`absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br ${cfg.glowBg} blur-2xl transition-all duration-500 group-hover:scale-150 pointer-events-none`} />

                                        {/* Top Row: SVG Icon Container & Degree Badge + Arrow CTA */}
                                        <div className="mb-5 flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                {/* Premium SVG Icon Container */}
                                                <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${cfg.iconBg} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-2`}>
                                                    <IconComponent className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <span className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase ${cfg.badge}`}>
                                                        {cfg.degreeLabel}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Interactive Arrow Button */}
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/25 group-hover:scale-105">
                                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                            </span>
                                        </div>

                                        {/* Program Name */}
                                        <h3 className="text-lg sm:text-xl font-black leading-snug text-slate-900 transition-colors duration-200 group-hover:text-blue-600">
                                            {programStudy.name}
                                        </h3>

                                        
                                        {/* Card Footer: Clear Click Indicator */}
                                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                                            <span className="inline-flex items-center gap-1 font-bold text-blue-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-700">
                                                <span>Pilih Prodi & Mulai</span>
                                                <ChevronRight className="h-3.5 w-3.5" />
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