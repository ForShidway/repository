"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect");

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
                throw new Error(data.message || "Gagal melakukan login");
            }

            if (redirectPath) {
                router.push(redirectPath);
            } else if (data.user.role === "ADMIN") {
                router.push("/admin");
            } else if (data.user.role === "DOSEN") {
                router.push("/dosen");
            } else {
                router.push("/mahasiswa");
            }
            router.refresh();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen bg-[#f8fafc]">
            {/* Left decorative panel */}
            <div className="relative hidden w-[46%] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#060f1e] via-[#0B1F3A] to-[#132D52] lg:flex">
                {/* Mesh background */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-700/15 blur-3xl" />
                    <div className="absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex max-w-sm flex-col items-center px-10 text-center">
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 text-xl font-extrabold text-white shadow-2xl shadow-blue-900/50">
                        RO
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">Repository Otomotif</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                        Platform repositori digital Jurusan Teknik Otomotif Universitas Negeri Padang.
                    </p>

                    {/* Stats mini */}
                    <div className="mt-10 grid w-full grid-cols-2 gap-3">
                        {[
                            { label: "Tugas Akhir", icon: "📄" },
                            { label: "Dosen", icon: "👨‍🏫" },
                            { label: "Program Studi", icon: "🎓" },
                            { label: "SDGs Terintegrasi", icon: "🌍" },
                        ].map((s) => (
                            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                                <p className="text-xl">{s.icon}</p>
                                <p className="mt-1 text-xs font-medium text-slate-400">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
                        <span className="text-xs font-semibold text-orange-300">Repository Resmi · UNP</span>
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
                <div className="w-full max-w-md">

                    {/* Logo (mobile only) */}
                    <div className="mb-8 flex justify-center lg:hidden">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-[#0B1F3A] text-sm font-extrabold text-white shadow-md">
                                RO
                            </div>
                            <div className="leading-tight">
                                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">Repository</div>
                                <div className="text-sm font-bold text-slate-900">Otomotif</div>
                            </div>
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
                        <div className="mb-6">
                            <h1 className="text-2xl font-extrabold text-slate-900">Selamat Datang</h1>
                            <p className="mt-1.5 text-sm text-slate-500">
                                Masuk ke akun Anda untuk melanjutkan.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                                    placeholder="nama@email.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-600"
                                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <svg className="mt-0.5 shrink-0 text-red-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    <p className="text-sm font-medium text-red-700">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-br from-blue-600 to-[#0B1F3A] py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:opacity-90 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.22-8.57"/></svg>
                                        Memproses...
                                    </span>
                                ) : "Masuk"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500">
                            Belum punya akun?{" "}
                            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
                                Daftar di sini
                            </Link>
                        </p>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        © 2026 Repository Otomotif · Universitas Negeri Padang
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}