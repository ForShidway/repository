"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Real-time validation helpers
    const isPasswordLengthValid = password.length >= 8;
    const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
    const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!name.trim() || !email.trim() || !password) {
            setError("Semua kolom bertanda wajib harus diisi");
            return;
        }

        if (password.length < 8) {
            setError("Password harus memiliki minimal 8 karakter");
            return;
        }

        if (password !== confirmPassword) {
            setError("Konfirmasi password tidak sesuai");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal melakukan registrasi akun");
            }

            router.push("/login?registered=true");
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses registrasi");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden bg-[#040D1A] flex items-center justify-center">
            {/* ── 1. BACKGROUND IMAGE ── */}
            <Image
                src="/images/background.png"
                alt="Gedung Jurusan Teknik Otomotif FT UNP"
                fill
                priority
                className="object-cover object-center"
            />

            {/* ── 2. CINEMATIC MULTI-LAYER CONTRAST SCRIMS ── */}
            {/* Horizontal directional scrim: deep navy on left for 100% legibility, gentle transparency on right */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#040D1A]/95 via-[#06152B]/90 to-[#040D1A]/95 lg:bg-gradient-to-r lg:from-[#040D1A]/95 lg:via-[#071933]/85 lg:to-[#091D3B]/45" />
            
            {/* Vertical vignette for depth and visual framing */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040D1A] via-transparent to-[#040D1A]/70 pointer-events-none" />
            
            {/* Subtle ambient glow behind left branding to create luxury depth */}
            <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

            {/* ── 3. MAIN WRAPPER ── */}
            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-between gap-10 px-5 py-8 sm:px-8 lg:min-h-screen lg:flex-row lg:items-center lg:py-12">

                {/* ── LEFT PANEL: HERO BRANDING & TRUST ELEMENTS ── */}
                <div className="flex flex-col justify-between gap-8 lg:max-w-xl xl:max-w-2xl">
                    
                    {/* Top action: Back to Home + Department Identity */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 shadow-sm backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/20 hover:text-white hover:-translate-x-0.5"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                <span>Kembali ke Beranda</span>
                            </Link>

                            <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-[11px] font-bold tracking-wider text-blue-200 uppercase backdrop-blur-md">
                                Portal Akademik
                            </span>
                        </div>

                        {/* Brand Logo & Name */}
                        <div className="flex items-center gap-3.5 pt-2">
                            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white p-2 shadow-2xl shadow-black/50 ring-1 ring-white/30 transition-transform hover:scale-105">
                                <img
                                    src="/images/logo-otomotif.png"
                                    alt="Logo Jurusan Otomotif"
                                    className="h-9 w-9 object-contain"
                                />
                            </div>
                            <div>
                                <div className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                                    Repository Otomotif
                                </div>
                                <div className="text-xs font-medium text-slate-300">
                                    Jurusan Teknik Otomotif · FT Universitas Negeri Padang
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Headline & Narrative */}
                    <div className="space-y-4">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.18]">
                            Satu Platform,{" "}
                            <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
                                Untuk Seluruh Riset & Karya Mahasiswa.
                            </span>
                        </h1>
                        
                        <p className="max-w-lg text-sm sm:text-base leading-relaxed text-slate-200 font-normal">
                            Daftarkan akun mahasiswa Anda untuk mulai mengelola, mengarsipkan skripsi, 
                            mengakses artikel jurnal ilmiah, serta berkolaborasi dalam ekosistem riset 
                            Jurusan Teknik Otomotif UNP.
                        </p>
                    </div>

                    {/* 4 Frosted Glass Value Proposition Cards */}
                    <div className="grid grid-cols-2 gap-3.5 sm:gap-4 max-w-xl">
                        <div className="group rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 sm:p-4 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/[0.12] hover:shadow-lg hover:shadow-black/20">
                            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30 transition group-hover:scale-110">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-white">Tugas Akhir & Skripsi</h3>
                            <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-snug">
                                Akses arsip skripsi, laporan magang, & dokumen akademik terstruktur.
                            </p>
                        </div>

                        <div className="group rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 sm:p-4 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/[0.12] hover:shadow-lg hover:shadow-black/20">
                            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30 transition group-hover:scale-110">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-white">Data Terlindungi</h3>
                            <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-snug">
                                Keamanan karya ilmiah terverifikasi resmi oleh sistem jurusan.
                            </p>
                        </div>

                        <div className="group rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 sm:p-4 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/[0.12] hover:shadow-lg hover:shadow-black/20">
                            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30 transition group-hover:scale-110">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-white">Riset Otomotif</h3>
                            <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-snug">
                                Eksplorasi inovasi kendaraan listrik, mesin, dan teknologi masa depan.
                            </p>
                        </div>

                        <div className="group rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 sm:p-4 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:bg-white/[0.12] hover:shadow-lg hover:shadow-black/20">
                            <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30 transition group-hover:scale-110">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                                    <path d="M16 3.13a4 4 0 010 7.75" />
                                </svg>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-white">Akses Kolaboratif</h3>
                            <p className="mt-1 text-[11px] sm:text-xs text-slate-300 leading-snug">
                                Terhubung dengan dosen pembimbing dan sesama mahasiswa.
                            </p>
                        </div>
                    </div>

                    {/* Department Tagline / Footnote */}
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Bersama Membangun Masa Depan Teknologi Otomotif Indonesia</span>
                    </div>
                </div>

                {/* ── RIGHT PANEL: PREMIUM REGISTRATION CARD ── */}
                <div className="w-full lg:w-auto flex justify-center">
                    <div className="w-full max-w-[440px] rounded-[28px] border border-white/80 bg-white/95 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(2,9,20,0.6),0_0_0_1px_rgba(255,255,255,0.7)] backdrop-blur-2xl">
                        
                        {/* Mobile Header (Shows when left panel is collapsed on mobile) */}
                        <div className="mb-6 flex items-center justify-between lg:hidden border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 p-1.5 shadow-md">
                                    <img src="/images/logo-otomotif.png" alt="Logo Otomotif" className="h-7 w-7 object-contain" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900 leading-tight">Repository Otomotif</div>
                                    <div className="text-[10px] text-slate-500">FT Universitas Negeri Padang</div>
                                </div>
                            </div>
                            <Link href="/" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                                Beranda
                            </Link>
                        </div>

                        {/* Card Title & Subtitle */}
                        <div className="text-center sm:text-left">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-100/80 mb-2">
                                Akun Mahasiswa
                            </span>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                Daftar Akun
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500">
                                Lengkapi data di bawah untuk mulai menggunakan repositori.
                            </p>
                        </div>

                        {/* Register Form */}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            
                            {/* Input: Nama Lengkap */}
                            <div>
                                <label htmlFor="name" className="mb-1.5 block text-xs font-bold text-slate-700">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-150 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                        placeholder="Contoh: Budi Santoso"
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            {/* Input: Email */}
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-700">
                                    Email Mahasiswa <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <path d="M2 7l10 6 10-6" />
                                        </svg>
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-150 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                        placeholder="nama@email.com / student.unp.ac.id"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Input: Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    {password.length > 0 && (
                                        <span className={`text-[11px] font-semibold transition-colors ${isPasswordLengthValid ? "text-emerald-600" : "text-amber-600"}`}>
                                            {isPasswordLengthValid ? "✓ 8+ karakter" : `${password.length}/8 karakter`}
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="10" rx="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-150 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                                        placeholder="Minimal 8 karakter"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 transition"
                                    >
                                        {showPassword ? (
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Input: Konfirmasi Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700">
                                        Konfirmasi Password <span className="text-red-500">*</span>
                                    </label>
                                    {confirmPassword.length > 0 && (
                                        <span className={`text-[11px] font-semibold transition-colors ${isPasswordMatch ? "text-emerald-600" : "text-amber-600"}`}>
                                            {isPasswordMatch ? "✓ Cocok" : "Belum sama"}
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="10" rx="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full rounded-xl border bg-slate-50/70 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-150 focus:bg-white focus:ring-4 ${
                                            isPasswordMismatch 
                                                ? "border-amber-300 focus:border-amber-500 focus:ring-amber-500/10" 
                                                : isPasswordMatch 
                                                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10"
                                                : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
                                        }`}
                                        placeholder="Ulangi password di atas"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Lihat konfirmasi password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 transition"
                                    >
                                        {showConfirmPassword ? (
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Alert Box */}
                            {error && (
                                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-red-800 animate-fadeIn">
                                    <svg className="mt-0.5 shrink-0 text-red-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    <p className="text-xs font-semibold leading-relaxed">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-[#0B1F3A] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-700/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin text-white" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M21 12a9 9 0 11-6.22-8.57"/>
                                        </svg>
                                        <span>Memproses Pendaftaran...</span>
                                    </span>
                                ) : (
                                    <>
                                        <span>Daftar Sekarang</span>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Switch to Login Link */}
                        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                            <p className="text-xs sm:text-sm text-slate-500">
                                Sudah memiliki akun?{" "}
                                <Link href="/login" className="font-bold text-blue-600 transition hover:text-blue-800 hover:underline">
                                    Masuk di sini
                                </Link>
                            </p>
                        </div>

                        {/* Security Assurance Badge */}
                        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <span>Data terenkripsi & tersimpan aman di server UNP</span>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}