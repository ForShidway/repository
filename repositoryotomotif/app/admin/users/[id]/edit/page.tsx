"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const id =  params.id;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"ADMIN" | "MAHASISWA" | "DOSEN">("MAHASISWA");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    // ambil data user dari api berdasarkan id 
    async function loadUser() {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`/api/users/${id}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "gagal mengabil data user");
            }
            setName(data.name);
            setEmail(data.email);
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error ? error.message : "Terjadi Kesaalahan"
            );
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
        if (!id) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(`/api/users/${id}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal mengambil data user"
                );
            }

            if (!cancelled) {
                setName(data.name);
                setEmail(data.email);
                setRole(data.role || "MAHASISWA");
            }
        } catch (error) {
            console.error(error);

            if (!cancelled) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Terjadi kesalahan"
                );
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    }

    fetchUser();

    return () => {
        cancelled = true;
    };
}, [id]);

    // update user
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if ( !name.trim() || !email.trim()) {
            setError("Nama dan email harus diisi dengan benar");
            return;
        }

        try {
            setSaving(true);
            const response = await fetch (`/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify ({
                    name: name.trim(),
                    email: email.trim(),
                    role,
                }),
            });

            const data = await response.json();
            if ( !response.ok) {
                throw new Error(data.message || "Gagal memperbarui data user");
            }
            router.push("/admin/users");
            router.refresh();

        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error ? error.message : "Terjadi kesalahan"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen p-8">
                <p>sedang Loading  memuat data user</p>
            </main>
        );
    }

    if (error && !name && !email) {
        return (
            <main className="min-h-screen p-8">
                <h1 className="text-2xl font-bold">Gagal, Terjadi Kesalahan</h1>
                <p className="mt-3 text-red-500">{error}</p>
                <button onClick={() => router.push("/admin/users")}
                className="mt-5 rounded-lg border px-4 py-2" >
                    Kembali ke Daftar User
                </button>
            </main>
        );
    }
    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Edit User</h1>
                </div>
                <p className="mt-2 text-gray-600">
                    Perbarui informasi pengguna
                </p>
            </div>
            <div className="rounded-xl border bg-white p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="mb-2 block-text-sm font-medium">
                            Nama
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-lg border px-4 py-3"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Masukkan email"
                            className="w-full rounded-lg border px-4 py-3"
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="mb-2 block text-sm font-medium">
                            Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(event) => setRole(event.target.value as "ADMIN" | "MAHASISWA" | "DOSEN")}
                            className="w-full rounded-lg border px-4 py-3"
                        >
                            <option value="MAHASISWA">Mahasiswa</option>
                            <option value="ADMIN">Admin</option>
                            <option value="DOSEN">Dosen</option>
                        </select>
                    </div>
                    {error && (
                        <div className="rounded-lg bg-red-50 p-4">
                            <p className="text-sm text-red-600"> 
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button type="button" onClick={() => router.push("/admin/users")} className="rounded-lg border px-5 py-3">
                            Batal
                        </button>
                        <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50">
                            {saving ? "Menyimpan..." : "simpan Perubahan"}
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );

}
