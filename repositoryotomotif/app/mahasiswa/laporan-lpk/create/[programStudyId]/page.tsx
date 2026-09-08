"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Dosen = {
    id: number;
    name: string;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_FILE_LABEL = "PDF, DOC, atau DOCX";

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LaporanPLKForm() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [nim, setNim] = useState("");
    const [namaInstansi, setNamaInstansi] = useState("");
    const [dosenPembimbingId, setDosenPembimbingId] = useState("");
    const [dosens, setDosens] = useState<Dosen[]>([]);

    const [tanggalMulai, setTanggalMulai] = useState("");
    const [tanggalSelesai, setTanggalSelesai] = useState("");

    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function fetchDosens() {
            try {
                const res = await fetch("/api/dosens");
                const data = await res.json();
                if (res.ok) setDosens(data);
            } catch (err) {
                console.error("Gagal mengambil data dosen", err);
            }
        }
        fetchDosens();
    }, []);

    function validateAndSetFile(candidate: File | null) {
        if (!candidate) {
            setFile(null);
            setFileError(null);
            return;
        }
        if (candidate.size > MAX_FILE_SIZE) {
            setFileError("Maksimal ukuran file adalah 100 MB");
            setFile(null);
            return;
        }
        if (!ALLOWED_FILE_TYPES.includes(candidate.type)) {
            setFileError(`File hanya boleh ${ALLOWED_FILE_LABEL}`);
            setFile(null);
            return;
        }
        setFileError(null);
        setFile(candidate);
    }

    const canSubmit =
        name.trim() &&
        nim.trim() &&
        namaInstansi.trim() &&
        dosenPembimbingId &&
        tanggalMulai &&
        tanggalSelesai &&
        file &&
        !fileError &&
        !loading;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!canSubmit) {
            setError("Semua data harus diisi, termasuk file laporan");
            return;
        }

        if (tanggalSelesai < tanggalMulai) {
            setError("Bulan selesai tidak boleh sebelum bulan mulai");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("nim", nim.trim());
            formData.append("namaInstansi", namaInstansi.trim());
            formData.append("dosenPembimbingId", dosenPembimbingId);
            formData.append("tanggalMulai", tanggalMulai);
            formData.append("tanggalSelesai", tanggalSelesai);
            if (file) formData.append("file", file);

            const response = await fetch("/api/laporanPlk", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengirim laporan PLK");
            }

            setSuccess(true);
            setName("");
            setNim("");
            setNamaInstansi("");
            setDosenPembimbingId("");
            setTanggalMulai("");
            setTanggalSelesai("");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            router.refresh();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Laporan PLK Baru</h1>
                    <p className="mt-2 text-gray-600">
                        Lengkapi data di bawah untuk mengunggah laporan PLK.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                        {/* NAMA + NIM */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                    Nama Mahasiswa
                                </label>
                                <input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>
                            <div>
                                <label htmlFor="nim" className="mb-2 block text-sm font-medium text-gray-700">
                                    NIM
                                </label>
                                <input
                                    id="nim"
                                    value={nim}
                                    onChange={(e) => setNim(e.target.value)}
                                    placeholder="Contoh: 23123456"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        {/* NAMA INSTANSI */}
                        <div>
                            <label htmlFor="namaInstansi" className="mb-2 block text-sm font-medium text-gray-700">
                                Nama Instansi
                            </label>
                            <input
                                id="namaInstansi"
                                value={namaInstansi}
                                onChange={(e) => setNamaInstansi(e.target.value)}
                                placeholder="Contoh: PT Astra Otoparts Tbk"
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                        </div>

                        {/* DOSEN PEMBIMBING */}
                        <div>
                            <label htmlFor="dosenPembimbing" className="mb-2 block text-sm font-medium text-gray-700">
                                Dosen Pembimbing
                            </label>
                            <select
                                id="dosenPembimbing"
                                value={dosenPembimbingId}
                                onChange={(e) => setDosenPembimbingId(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            >
                                <option value="">-- Pilih Dosen Pembimbing --</option>
                                {dosens.map((dosen) => (
                                    <option key={dosen.id} value={dosen.id}>
                                        {dosen.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PERIODE MAGANG */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tanggalMulai" className="mb-2 block text-sm font-medium text-gray-700">
                                    Mulai Magang
                                </label>
                                <input
                                    id="tanggalMulai"
                                    type="month"
                                    value={tanggalMulai}
                                    onChange={(e) => setTanggalMulai(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>
                            <div>
                                <label htmlFor="tanggalSelesai" className="mb-2 block text-sm font-medium text-gray-700">
                                    Selesai Magang
                                </label>
                                <input
                                    id="tanggalSelesai"
                                    type="month"
                                    value={tanggalSelesai}
                                    onChange={(e) => setTanggalSelesai(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        {/* BERKAS */}
                        <div>
                            <label htmlFor="file" className="mb-2 block text-sm font-medium text-gray-700">
                                Berkas Laporan <span className="font-normal text-slate-400">({ALLOWED_FILE_LABEL}, maksimal 100 MB)</span>
                            </label>

                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    validateAndSetFile(e.dataTransfer.files?.[0] ?? null);
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
                                    isDragging
                                        ? "border-blue-400 bg-blue-50"
                                        : fileError
                                          ? "border-red-300 bg-red-50"
                                          : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    id="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
                                    className="hidden"
                                />
                                {file ? (
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                                        <span className="font-semibold text-slate-800">{file.name}</span>
                                        <span className="text-slate-400">{formatBytes(file.size)}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                validateAndSetFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                            className="font-semibold text-red-500 hover:text-red-700"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Klik atau seret berkas ke sini</p>
                                )}
                            </div>
                            {fileError && (
                                <p className="mt-1.5 text-xs text-red-500">{fileError}</p>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <p className="text-sm text-emerald-700">Laporan PKL berhasil dikirim.</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? "Mengirim..." : "Kirim Laporan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}