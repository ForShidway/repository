"use client";

import { FormEvent, useState } from "react";
import {useRouter} from "next/navigation";


export default function CreateDosenPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("Nama harus Di isi");
            return
        }

        try{
            setLoading(true);
            const response = await fetch("/api/dosens", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                }),
            });

            const data = await response.json();
            if (!response.ok)  {
                throw new Error(
                    data.message || "Gagal Membuat Dosen"
                    
                )
            }
            router.push("/admin/dosens");
            router.refresh();
        } catch (error) {
            console.error(error);
                setError(
                    error instanceof Error ? error.message : "Terjadi kessaalaan "
                )
            
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8" >
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold txt-gray-900"> Tambah Dosen</h1>
                    <p className="mt-2 text-gray-600"> Tambahakn Dosen baru ke repository jurusan</p>
                </div>
                <div className="rounded-xl border bg-whte p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label  htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700"> 
                                Nama </label>
                            <input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)} />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200  bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button type="button" onClick={() => router.push("/admin/dosens")}>
                                Batal
                            </button>
                            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {loading ? "Menyimpan...." : "Simpan Dosen"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )

}