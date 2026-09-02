"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!name.trim() || !email.trim() || !password || !role.trim()) {
            setError("Nama, email, password, dan role harus diisi");
            return;
        }
        if (password.length < 8 ) {
            setError("Password minimal harus berisi 8 karakter");
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
                    password,
                    role,
                }),
            });

            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
                ? await response.json()
                : null;

            if (!response.ok) {
                throw new Error(
                    data?.message || "Gagal membuat User"
                );
            }

            router.push("/admin/users");
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
                    <h1 className="text-3xl font-bold text-gray-900"> Tambah User</h1>
                    <p className="mt-2 text-gray-600">Tambahkan pengguna baru ke Repositori Otomotif</p>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                Nama
                            </label>
                            <input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)}
                            placeholder="contoh@gmail.com" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div>
                            <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(event) => setRole(event.target.value as "MAHASISWA" | "ADMIN")}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="MAHASISWA">Mahasiswa</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200  bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600"> {error} </p>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <button type="button" onClick={() => router.push("/admin/users")}
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
