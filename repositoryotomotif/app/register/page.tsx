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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!name.trim() || !email.trim() || !password) {
            setError("Semua data harus diisi");
            return;
        }
        // if ( register ) {!nextResponse.json { message}
        // }

        if (password.length < 8) {
            setError("Password minimal 8 karakter");
            return;
        }

        if (password !== confirmPassword) {
            setError("Konfirmasi password tidak sama");
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
                throw new Error(data.message || "Gagal melakukan registrasi");
            }

            router.push("/login");
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-8">
            <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300/50 lg:grid-cols-2">

                {/* KIRI — ILUSTRASI */}
                <div className="relative hidden bg-gradient-to-br from-blue-50 to-indigo-50 lg:block">
                    <Image
                        src="/images/register_ilustration.jpg"
                        alt="Ilustrasi Repository Otomotif"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* KANAN — FORM */}
                <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">

                    {/* Logo */}
                    <div className="mb-10 flex justify-end">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-100">
                                RO
                            </div>
                            <div className="leading-tight">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
                                    Repository
                                </div>
                                <div className="text-sm font-bold text-slate-900">
                                    Otomotif
                                </div>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">Daftar Akun</h1>
                    <p className="mt-2 text-slate-500">
                        Buat akun mahasiswa untuk mulai menggunakan repository.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                placeholder="Contoh: Budi Santoso"
                                autoComplete="name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                placeholder="nama@email.com"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    placeholder="Minimal 8 karakter"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

                        <div>
                            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                                Konfirmasi Password
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                placeholder="Ulangi password"
                                autoComplete="new-password"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Memproses..." : "Daftar"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}