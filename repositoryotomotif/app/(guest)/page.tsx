"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Dosen = {
    id: number;
    name: string;
};
type SDGs = {
    id: number;
    code: string;
    title: string;
};
type Ruangan = {
    id: number;
    name: string;
};
type Mahasiswa = {
    id: number;
    name: string;
    nim: string;
    urutan: number;
};

type TugasAkhir = {
    id: number;
    tahunMasuk: number;
    judul: string;
    mataKuliahRelevan: string;
    ruangan: Ruangan;
    pembimbing: Dosen;
    dosenPa: Dosen;
    mahasiswa: Mahasiswa[];
    sdgs: SDGs[];
};
type HomeData = {
    statistics: {
        totalTugasAkhir: number;
        totalDosen: number;
        totalRuangan: number;
        totalSDGs: number;
    };
    tugasAkhirTerbaru: TugasAkhir[];
};

const features = [
    {
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        title: "Pencarian Cerdas",
        desc: "Cari Tugas Akhir berdasarkan judul, nama mahasiswa, NIM, atau bidang teknologi.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
            </svg>
        ),
    },
    {
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        title: "Filter Lengkap",
        desc: "Filter berdasarkan program studi, tahun, SDGs, dosen pembimbing, dan ruangan.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
        ),
    },
    {
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
        title: "Statistik Informatif",
        desc: "Lihat statistik dan analisis data Tugas Akhir berdasarkan berbagai kriteria.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
        ),
    },
    {
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        title: "Akses Mudah",
        desc: "Unduh file Tugas Akhir dengan mudah dan akses informasi lengkap.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
        ),
    },
];

export default function GuestHomePage() {
    const [data, setData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchHomeData() {
            try {
                setLoading(true);
                const response = await fetch("/api/guest/home");
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Gagal mengambil data");
                }
                setData(result);
            } catch (error) {
                console.error(error);
                setError(
                    error instanceof Error ? error.message : "Terjadi Kesalahan"
                );
            } finally {
                setLoading(false);
            }
        }
        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-[calc(100vh-72px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                    <p className="text-sm text-slate-500">Memuat Repository...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
                    <p className="font-semibold text-red-700">Gagal memuat data</p>
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>
            </main>
        );
    }

    const periodeTersedia = "2021 - 2026";
    const formatMahasiswa = (mahasiswa: Mahasiswa[] = []) => {
        if (!mahasiswa.length) return "-";
        return mahasiswa.map((m) => `${m.name} (${m.nim})`).join(", ");
    };

    const stats = [
        {
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            value: data?.statistics.totalTugasAkhir ?? 0,
            label: "Tugas Akhir",
            sub: "Tersedia",
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            ),
        },
        {
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            value: data?.statistics.totalDosen ?? 0,
            label: "Dosen Pembimbing",
            sub: "Aktif",
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
            ),
        },
        {
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            value: data?.statistics.totalSDGs ?? 0,
            label: "SDGs",
            sub: "Tersedia",
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
            ),
        },
        {
            iconBg: "bg-orange-50",
            iconColor: "text-orange-600",
            value: periodeTersedia,
            label: "Periode",
            sub: "Tersedia",
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
        },
    ];

    return (
        <main>
            {/* =========================================
                HERO
            ========================================= */}
            <section className="relative bg-[#E4FBFF]">
                <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 pt-14 lg:grid-cols-2 lg:items-center lg:px-8 lg:pb-32 lg:pt-16">
                    {/* Left: text */}
                    <div>
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            Selamat Datang di Repository Jurusan Teknik Otomotif
                        </span>

                        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                            Pusat Pengetahuan
                            <span className="block text-blue-600">
                                Teknologi Otomotif
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                            Jelajahi koleksi Tugas Akhir mahasiswa D3 dan D4 Teknologi
                            Otomotif Universitas  Negeri Padang. Temukan inovasi, penelitian,
                            dan solusi teknologi untuk masa depan otomotif.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/jelajahirepository"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                📖 Jelajahi Repository
                            </Link>
                            <Link
                                href="/dosen"
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:border-blue-200"
                            >
                                👥 Lihat Dosen
                            </Link>
                        </div>
                    </div>

                    {/* Right: illustration placeholder (no photo) */}
                    <div className="relative">
                        <div className="absolute -right-6 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-blue-100/70 lg:h-[480px] lg:w-[480px]" />

                        <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-xl sm:h-[400px] lg:h-[460px]">
                            {/* dekorasi titik-titik */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle, rgba(255,255,255,0.6) 1.5px, transparent 1.5px)",
                                    backgroundSize: "22px 22px",
                                }}
                            />

                            {/* ikon mobil sebagai placeholder */}
                            <svg
                                width="180"
                                height="180"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="relative opacity-90"
                            >
                                <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 012 2v4h-2" />
                                <circle cx="7.5" cy="17.5" r="2.5" />
                                <circle cx="17.5" cy="17.5" r="2.5" />
                                <path d="M5 12h13" />
                            </svg>

                            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
                                Repository Otomotif
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats card — overlaps bottom edge of hero */}
                <div className="absolute inset-x-0 bottom-0 z-10 translate-y-1/2 px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl rounded-2xl border border-slate-100 bg-white px-6 py-7 shadow-xl shadow-slate-200/60 sm:px-10">
                        <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-6">
                            {stats.map((s) => (
                                <div key={s.label} className="flex items-center gap-3">
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.iconBg} ${s.iconColor}`}
                                    >
                                        {s.icon}
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold leading-tight text-slate-900">
                                            {s.value}
                                        </p>
                                        <p className="text-sm font-medium leading-tight text-slate-700">
                                            {s.label}
                                        </p>
                                        <p className="text-xs text-slate-400">{s.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Spacer to compensate for the overlapping stats card */}
            <div className="h-20 sm:h-16 bg-[#F4F9F9]" />

            {/* =========================================
                FITUR REPOSITORY
            ========================================= */}
            <section className=" bg-[#F4F9F9]" >
                <div className="mx-auto max-w-7xl   px-6 py-20 lg:px-8">
                     <div className="mx-auto mb-12 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Fitur Repository
                        </h2>
                        <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-blue-600" />
                        <p className="mt-4 text-slate-500">
                            Temukan berbagai fitur yang membantu Anda menjelajahi dan
                            memahami koleksi Tugas Akhir
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 bg-[#F4F9F9]">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div
                                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${f.iconBg} ${f.iconColor}`}
                                >
                                    {f.icon}
                                </div>
                                <h3 className="mb-2 font-bold text-slate-900">{f.title}</h3>
                                <p className="text-sm leading-6 text-slate-500">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}