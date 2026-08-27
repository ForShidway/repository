"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditRuanganPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadRuangan() {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`/api/ruangans/${id}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Gagal mengambil data ruangan");
            }
            setName(data.name);
        } catch (error) {
            console.error(error);
            setError(error instanceof Error ? error.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) {
            loadRuangan();
        }
    }, [id]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("Nama harus diisi dengan benar");
            return;
        }

        try {
            setSaving(true);
            const response = await fetch(`/api/ruangans/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Gagal memperbarui data ruangan");
            }
            router.push("/admin/ruangans");
            router.refresh();
        } catch (error) {
            console.error(error);
            setError(error instanceof Error ? error.message : "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <main className="page-shell"><p>Memuat data ruangan...</p></main>;
    }

    if (error && !name) {
        return (
            <main className="page-shell">
                <h1 className="text-2xl font-bold">Gagal memuat data</h1>
                <p className="mt-3 text-red-500">{error}</p>
                <button onClick={() => router.push("/admin/ruangans")} className="mt-5 rounded-lg border px-4 py-2">
                    Kembali ke daftar ruangan
                </button>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <p className="eyebrow">Pusat administrasi</p>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Data Ruangan</h1>
                    <p className="mt-2 text-gray-600">Perbarui informasi ruangan ujian.</p>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">Nama</label>
                            <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border px-4 py-3" />
                        </div>
                        {error && <div className="rounded-lg bg-red-50 p-4"><p className="text-sm text-red-600">{error}</p></div>}
                        <div className="flex gap-3">
                            <button type="button" onClick={() => router.push("/admin/ruangans")} className="rounded-lg border px-5 py-3">Batal</button>
                            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-50">
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
