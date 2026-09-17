"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        <main className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 flex items-center justify-center py-12 px-4">
            {/* Form Card */}
            <div className="w-full max-w-[440px] rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60">
                {/* Logo & Judul di samping logo (sama persis seperti di guest dashboard) */}
                <div className="mb-6 flex items-center justify-center">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 transition group-hover:scale-105">
                            <img
                                src="/images/logo-otomotif.png"
                                alt="Logo Jurusan Otomotif"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div className="leading-tight text-left">
                            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">
                                Repository
                            </div>
                            <div className="text-base font-extrabold text-slate-900 -mt-0.5">
                                Otomotif UNP
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Header Daftar */}
                <div className="mb-5 text-center border-t border-slate-100 pt-4">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        Daftar Akun Baru
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Lengkapi data di bawah untuk mulai menggunakan repositori.
                    </p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nama Lengkap */}
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

                    {/* Email */}
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

                    {/* Password */}
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
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Konfirmasi Password */}
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
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
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
                        className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 px-4 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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

                {/* Back to Home & Security Badge */}
                <div className="mt-4 flex flex-col items-center gap-2 text-center">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Beranda
                    </Link>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <span>Data terenkripsi & tersimpan aman di server UNP</span>
                    </div>
                </div>
            </div>
        </main>
    );
}