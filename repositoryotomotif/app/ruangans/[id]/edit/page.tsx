"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const id =  params.id;
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    // ambil data user dari api berdasarkan id 
    async function loadRuangan() {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`/api/ruangans/${id}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "gagal mengambil data ruangan");
            }
            setName(data.name);

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
        if (id) {
            loadRuangan();
        }
    }, [id]);

    // update ruangan
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if ( !name.trim()) {
            setError("Nama harus diisi dengan benar");
            return;
        }

        try {
            setSaving(true);
            const response = await fetch (`/api/ruangans/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify ({
                    name: name.trim(),
                }),
            });

            const data = await response.json();
            if ( !response.ok) {
                throw new Error(data.message || "Gagal memperbarui data ruangan");
            }
            router.push("/ruangans");
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
                <p>sedang Loading  memuat data ruangan</p>
            </main>
        );
    }

    if (error && !name ) {
        return (
            <main className="min-h-screen p-8">
                <h1 className="text-2xl font-bold">Gagal, Terjadi Kesalahan</h1>
                <p className="mt-3 text-red-500">{error}</p>
                <button onClick={() => router.push("/ruangans")}
                className="mt-5 rounded-lg border px-4 py-2" >
                    Kembali ke Daftar Ruangan
                </button>
            </main>
        );
    }
    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Edit Data Ruangan</h1>
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
                    
                    {error && (
                        <div className="rounded-lg bg-red-50 p-4">
                            <p className="text-sm text-red-600"> 
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button type="button" onClick={() => router.push("/ruangans")} className="rounded-lg border px-5 py-3">
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
