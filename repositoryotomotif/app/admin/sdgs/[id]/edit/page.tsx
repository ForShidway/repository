"use client";

import { FormEvent, useEffect, useState, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditSDGsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchSDGs() {
            try {
                const response = await fetch(`/api/sdgs/${id}`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Gagal mengambil data SDGs");
                }
                setCode(data.code);
                setTitle(data.title);
                setDescription(data.description || "");
                setExistingImageUrl(data.imageUrl || null);
            } catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Gagal mengambil data SDGs");
            } finally {
                setLoading(false);
            }
        }
        if (id) {
            fetchSDGs();
        }
    }, [id]);

    function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Ukuran file gambar maksimal 5MB");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setRemoveExistingImage(false);
            setError("");
        }
    }

    function handleRemoveImage() {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        setRemoveExistingImage(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        if (!code.trim() || !title.trim()) {
            setError("Kode dan judul SDGs wajib diisi");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("code", code.trim());
            formData.append("title", title.trim());
            formData.append("description", description.trim() || "");

            if (removeExistingImage) {
                formData.append("removeImage", "true");
            }

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await fetch(`/api/sdgs/${id}`, {
                method: "PUT",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Gagal memperbarui SDGs");
            }

            router.push("/admin/sdgs");
            router.refresh();
        } catch (error) {
            console.error(error);
            setError(error instanceof Error ? error.message : "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-500 font-medium">Memuat data SDG...</p>
            </div>
        );
    }

    const currentDisplayImage = imagePreview || (!removeExistingImage ? existingImageUrl : null);

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Edit SDGs</h1>
                    <p className="mt-2 text-gray-600">Perbarui informasi SDGs dan gambar logo opsional.</p>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="code" className="mb-2 block text-sm font-medium text-gray-700">
                                Kode SDGs *
                            </label>
                            <input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                                Judul SDGs *
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                                Deskripsi (Opsional)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Upload / Change Image (Opsional) */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Gambar Logo SDG (Opsional)
                            </label>
                            <div className="flex items-center gap-4">
                                {currentDisplayImage ? (
                                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-1">
                                        <img src={currentDisplayImage} alt="Logo SDG" className="h-full w-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                                            title="Hapus gambar"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                                        <span className="text-xs text-center px-1">Tidak ada gambar</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Pilih gambar baru jika ingin mengganti logo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.push("/admin/sdgs")}
                                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}