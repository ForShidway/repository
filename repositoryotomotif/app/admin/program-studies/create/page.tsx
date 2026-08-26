"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProgramStudyPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [degree, setDegree] = useState("");
    const [description, setDescription] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!name.trim() || !degree.trim()) {
            setError(
                "Nama Program Studi dan jenjang wajib diisi"
            );

            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/api/program-studies",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        degree: degree.trim(),
                        description:
                            description.trim() ||
                            null,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Gagal membuat Program Studi"
                );
            }

            router.push("/admin/program-studies");
            router.refresh();
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Tambah Program Studi
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Tambahkan Program Studi baru ke
                        Repository Otomotif.
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Nama Program Studi
                            </label>

                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                placeholder="Contoh: Teknologi Rekayasa Otomotif"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="degree"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Jenjang
                            </label>

                            <select
                                id="degree"
                                value={degree}
                                onChange={(event) =>
                                    setDegree(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">
                                    Pilih Jenjang
                                </option>

                                <option value="D3">
                                    D3
                                </option>

                                <option value="D4">
                                    D4
                                </option>

                                <option value="S1">
                                    S1
                                </option>

                                <option value="S2">
                                    S2
                                </option>

                                <option value="S3">
                                    S3
                                </option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Deskripsi
                            </label>

                            <textarea
                                id="description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                rows={4}
                                placeholder="Deskripsi Program Studi (opsional)"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/admin/program-studies"
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Menyimpan..."
                                    : "Simpan Program Studi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}