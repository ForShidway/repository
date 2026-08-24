"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSDGsPage() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");
        if (!code.trim() || !title.trim()) {
            setError(
                "Kode dan judul SDGs wajib diisi"
            );
            return;
        }
        try {
            setLoading(true);
            const response = await fetch("/api/sdgs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: code.trim(),
                    title: title.trim(),
                    description: description.trim() || null,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(  data.message || "Gagal membuat SDGs" );
            }
            router.push("/sdgs");
            router.refresh();
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error  ? error.message : "Terjadi kesalahan"
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">  Tambah SDG </h1>
                    <p className="mt-2 text-gray-600">  Tambahkan Sustainable Development  Goal baru ke repository. </p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6"  >
                        <div>
                            <label  htmlFor="code" className="mb-2 block text-sm font-medium text-gray-700" > Kode SDG </label>
                            <input id="code" type="text" value={code}
                                onChange={(event) => setCode(event.target.value) }
                                placeholder="Contoh: SDG 1" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div>
                            <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700" >  Judul SDG </label>
                            <input  id="title" type="text" value={title}
                                onChange={(event) => setTitle(event.target.value) }
                                placeholder="Contoh: Tanpa Kemiskinan"  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"  />
                        </div>
                        <div>
                            <label  htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700" >
                                Deskripsi
                            </label>
                            <textarea  id="description" value={description}
                                onChange={(event) => setDescription(  event.target.value )} rows={5}
                                placeholder="Masukkan deskripsi SDG..." className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"  />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600"> {error} </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button type="button"  onClick={() => router.push("/sdgs") }
                                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100" >
                                Batal
                            </button>
                            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" >
                                {loading ? "Menyimpan..." : "Simpan SDG"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}