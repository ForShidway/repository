"use client";

import { FormEvent, useEffect, useState, } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditSDGsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchSDGs() {
            try {
                const response = await fetch(  `/api/sdgs/${id}` );
                const data = await response.json();
                if (!response.ok) {
                    throw new Error( data.message || "Gagal mengambil data SDGs" );
                }
                setCode(data.code);
                setTitle(data.title);
                setDescription(  data.description || "" );
            } catch (error) {
                console.error(error);
                setError( error instanceof Error ? error.message : "Gagal mengambil data SDGs" );
            } finally {
                setLoading(false);
            }
        }
        if (id) {
            fetchSDGs();
        }
    }, [id]);

    async function handleSubmit( event: FormEvent<HTMLFormElement>) {  event.preventDefault();
        setError("");
        if (!code.trim() || !title.trim()) {
            setError( "Kode dan judul SDGs wajib diisi"  );
            return;
        }
        try {
            setSaving(true);
            const response = await fetch(  `/api/sdgs/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type":  "application/json",  },
                    body: JSON.stringify({
                        code: code.trim(),
                        title: title.trim(),
                        description: description.trim() || null,
                    }),
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error( data.message || "Gagal memperbarui SDGs"  );
            }
                router.push("/admin/sdgs");
            router.refresh();
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error  ? error.message : "Terjadi kesalahan"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit SDGs
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Perbarui informasi SDGs.
                    </p>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form  onSubmit={handleSubmit} className="space-y-6" >
                        <div>
                            <label  htmlFor="code"  className="mb-2 block text-sm font-medium text-gray-700" >
                                Kode SDGs
                            </label>
                            <input id="code" type="text" value={code}
                                onChange={(e) => setCode(e.target.value) }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3" />
                        </div>
                        <div>
                            <label  htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700" >
                                Judul SDGs
                            </label>
                            <input  id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value) } className="w-full rounded-lg border border-gray-300 px-4 py-3" />
                        </div>

                        <div>
                            <label  htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700" >
                                Deskripsi
                            </label>

                            <textarea id="description" value={description}
                                onChange={(e) => setDescription( e.target.value ) } rows={5}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3" />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button type="button" onClick={() =>  router.push("/admin/sdgs") }  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100" >
                                Batal
                            </button>

                            <button  type="submit"  disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" >
                                {saving ? "Menyimpan..."  : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}