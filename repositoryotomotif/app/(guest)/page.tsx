"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

// Skema warna baru:
// - Navy (#0B1F3A -> #132D52) sebagai warna utama/hero, kesan teknik & profesional
// - Biru (blue-700/800) sebagai warna aksi/brand di area terang
// - Oranye (orange-500) sebagai SATU-SATUNYA warna aksen, dipakai konsisten untuk CTA utama & highlight
// Ikon fitur & statistik memakai satu ramp warna (biru) agar tidak terkesan "pelangi"

const features = [
    {
        iconBg: "bg-blue-50",
        iconColor: "text-blue-800",
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
        iconBg: "bg-blue-50",
        iconColor: "text-blue-800",
        title: "Filter Lengkap",
        desc: "Filter berdasarkan program studi, tahun, SDGs, dosen pembimbing, dan ruangan.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
        ),
    },
    {
        iconBg: "bg-blue-50",
        iconColor: "text-blue-800",
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
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800" />
                    <p className="text-sm text-slate-500">Memuat Repository...</p>
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
            iconColor: "text-blue-800",
            value: data?.statistics?.totalTugasAkhir ?? 0,
            label: "Tugas Akhir",
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
            iconBg: "bg-blue-50",
            iconColor: "text-blue-800",
            value: data?.statistics?.totalDosen ?? 0,
            label: "Dosen Pembimbing",
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
            iconBg: "bg-blue-50",
            iconColor: "text-blue-800",
            value: data?.statistics?.totalSDGs ?? 0,
            label: "SDGs",
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
            {error && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs font-medium text-amber-700">
                    Perhatian: Data statistik live belum dapat dimuat ({error}). Menampilkan data default.
                </div>
            )}
            {/* =========================================
                HERO — navy gelap agar kontras & terasa lebih "teknik/profesional"
            ========================================= */}
            <section className="relative bg-gradient-to-br from-[#0B1F3A] to-[#132D52]">
                <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-36 pt-14 lg:grid-cols-2 lg:items-center lg:px-8 lg:pb-32 lg:pt-16">

                    <div>
                        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/15">
                            <span className="h-2 w-2 rounded-full bg-orange-400" />Selamat Datang di Repository Jurusan Teknik Otomotif</span>

                        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                            Pusat Pengetahuan
                            <span className="block text-orange-400">
                                Teknologi Otomotif
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                            Jelajahi koleksi Tugas Akhir mahasiswa D3 dan D4 Teknologi
                            Otomotif Universitas Negeri Padang. Temukan inovasi, penelitian,
                            dan solusi teknologi untuk masa depan otomotif.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/jelajahirepository"
                                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                            >
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                </svg>
                                Jelajahi Repository
                            </Link>
                            <Link
                                href="/sdgs"
                                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder-check"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="m9 13 2 2 4-4"/></svg>
                                SDGs
                            </Link>
                        </div>
                    </div>

                        {/* <div className="absolute -right-1 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-white/5 lg:h-[480px] lg:w-[480px]" /> */}
                
                        <div className="relative h-[320px] w-full   sm:h-[400px] lg:h-[460px]">
                            <img  src="/images/guestdashboard.png" alt="Repository Otomotif" className="object-cover" />
                        </div>
                  
                </div>

                {/* Wave divider — transisi lengkung dari navy ke section putih, di belakang stats card */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-10 overflow-hidden leading-[0]">
                    <svg
                        viewBox="0 0 1440 110"
                        preserveAspectRatio="none"
                        className="h-[56px] w-full sm:h-[90px]"
                    >
                        <path
                            d="M0,50 C240,100 480,0 720,35 C960,70 1200,10 1440,55 L1440,110 L0,110 Z"
                            fill="#FFFFFF"
                        />
                    </svg>
                </div>

                {/* Stats card — overlaps bottom edge of hero */}
                <div className="absolute inset-x-0 bottom-0 z-10 translate-y-1/2 px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl rounded-2xl border border-slate-300 bg-white px-6 py-7 shadow-xl shadow-slate-900/10 sm:px-10">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Spacer to compensate for the overlapping stats card */}
            <div className="h-20 bg-white sm:h-16" />

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Fitur Repository
                        </h2>
                        <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-orange-500" />
                        <p className="mt-4 text-slate-500">
                            Temukan berbagai fitur yang membantu Anda menjelajahi dan
                            memahami koleksi Tugas Akhir
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 bg-white">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="rounded-2xl border border-slate-300 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
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