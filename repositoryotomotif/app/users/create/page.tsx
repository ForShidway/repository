"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { discoverValidationDepths } from "next/dist/server/app-render/instant-validation/instant-validation";

export default function CreateUserPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!name.trim() || !email.trim()) {
            setError("Nama dan email Harus diisi");
            return;
        }
        try {
            setLoading(true);
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal membuat User"
                );
            }
            router.push("/users");
            router.refresh();
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error ? error.message : "Terjadi Kesalahan"
            );
        } finally {
            setLoading(false);
        }
    }
    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold txt-gray-900"> Tambah User</h1>
                    <p className="mt-2 text-gray-600">Tambahkan pengguna baru ke Repositori Otomotif</p>
                </div>
                <div className="rounded-xl border bg-whte p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                Nama
                            </label>
                            <input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)}
                            placeholder="contoh@gmail.com" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200  bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600"> {error} </p>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <button type="button" onClick={() => router.push("/users")}
                                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100">
                                Batal
                            </button>
                            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {loading ? "Menyimpan..." : "Simpan User"}
                            </button>
                        </div>


                    </form>

                </div>
            </div>
        </main>
    )
}
