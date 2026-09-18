"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");
    const isJustRegistered = searchParams.get("registered") === "true";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Email dan password harus diisi");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Email atau password yang Anda masukkan salah");
            }

            if (redirectPath) {
                router.push(redirectPath);
            } else if (data.user?.role === "ADMIN") {
                router.push("/admin");
            } else if (data.user?.role === "DOSEN") {
                router.push("/dosen");
            } else {
                router.push("/mahasiswa");
            }
            router.refresh();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/50 flex items-center justify-center py-12 px-4">
            {/* Form Card */}
            <div className="w-full max-w-[420px] rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xl shadow-slate-200/60">
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

                {/* Header Masuk */}
                <div className="mb-5 text-center border-t border-slate-100 pt-4">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        Masuk ke Akun
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Masukkan email dan password untuk melanjutkan
                    </p>
                </div>

                {/* Success Alert */}
                {isJustRegistered && (
                    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-emerald-800 animate-fadeIn">
                        <svg className="mt-0.5 shrink-0 text-emerald-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <p className="text-xs font-semibold leading-relaxed">
                            Registrasi berhasil! Silakan masuk menggunakan akun Anda.
                        </p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-700">
                            Alamat Email 
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
                                placeholder="nama@email.com"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                                Password 
                            </label>
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
                                placeholder="Masukkan password Anda"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
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

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-red-800 animate-fadeIn">
                            <svg className="mt-0.5 shrink-0 text-red-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
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
                                    <path d="M21 12a9 9 0 11-6.22-8.57" />
                                </svg>
                                <span>Memverifikasi Akun...</span>
                            </span>
                        ) : (
                            <>
                                <span>Masuk Sekarang</span>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Switch to Register */}
                <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                    <p className="text-xs sm:text-sm text-slate-500">
                        Belum memiliki akun mahasiswa?{" "}
                        <Link href="/register" className="font-bold text-blue-600 transition hover:text-blue-800 hover:underline">
                            Daftar di sini
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
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
                    <svg className="animate-spin text-blue-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 11-6.22-8.57" />
                    </svg>
                    <span>Memuat halaman...</span>
                </div>
            </main>
        }>
            <LoginForm />
        </Suspense>
    );
}