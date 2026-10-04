"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type LaporanType = "PI" | "PLK" | "KP";

type LaporanDetail = {
    id: number;
    name: string;
    nim: string;
    judul: string;
    namaInstansi: string;
    alamat: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    fileName: string | null;
    filePath: string | null;
    fileSize: number | null;
    fileType: string | null;
    fileNameAktivitas: string | null;
    filePathAktivitas: string | null;
    fileSizeAktivitas: number | null;
    fileTypeAktivitas: string | null;
    dosenPembimbing: { id: number; name: string };
};

function formatDate(value: string | null | undefined) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(d);
}

function formatFileSize(value: number | null) {
    if (!value) return "Ukuran file tidak tersedia";
    if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(value: string | null) {
    if (!value) return "DOKUMEN";
    if (value.includes("pdf")) return "PDF";
    if (value.includes("wordprocessingml")) return "DOCX";
    if (value.includes("msword")) return "DOC";
    return value.split("/").pop()?.toUpperCase() ?? "DOKUMEN";
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-1.5 break-words text-sm font-semibold leading-relaxed text-slate-800">{value || "-"}</p>
        </div>
    );
}

function FileCard({
    label,
    fileName,
    filePath,
    fileSize,
    fileType,
    accentClasses,
}: {
    label: string;
    fileName: string | null;
    filePath: string | null;
    fileSize: number | null;
    fileType: string | null;
    accentClasses: { icon: string };
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses.icon}`}>
                        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{fileName || "Belum ada file"} {filePath ? `· ${formatFileSize(fileSize)}` : ""}</p>
                    </div>
                </div>
                {filePath ? (
                    <div className="flex flex-wrap gap-2">
                        <a href={filePath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                            Lihat {fileTypeLabel(fileType)}
                        </a>
                        <a href={filePath} download={fileName || true} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                            <span aria-hidden="true">↓</span> Unduh File
                        </a>
                    </div>
                ) : <span className="text-sm text-slate-400">File belum tersedia</span>}
            </div>
        </section>
    );
}

export default function LaporanDetailPage({ type }: { type: LaporanType }) {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [data, setData] = useState<LaporanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isPi = type === "PI";
    const isKp = type === "KP";
    const label = isPi ? "Laporan PI" : isKp ? "Laporan Kerja Praktek" : "Laporan PLK";
    const endpoint = isPi ? "/api/laporanPi" : isKp ? "/api/laporanKp" : "/api/laporanPlk";

    useEffect(() => {
        async function fetchDetail() {
            try {
                const response = await fetch(`${endpoint}/${params.id}`);
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || `Gagal mengambil detail ${label}`);
                setData(result);
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : `Gagal mengambil detail ${label}`);
            } finally {
                setLoading(false);
            }
        }

        if (params.id) fetchDetail();
    }, [endpoint, label, params.id]);

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/jelajahirepository");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-5">
                    <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="h-52 animate-pulse rounded-2xl bg-white shadow-sm" />
                    <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
                </div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
                    <p className="font-semibold text-red-700">{error || `${label} tidak ditemukan`}</p>
                    <button type="button" onClick={handleBack} className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
                        Kembali
                    </button>
                </div>
            </main>
        );
    }

    const accentClasses = isPi
        ? { badge: "bg-amber-100 text-amber-800", icon: "bg-amber-50 text-amber-700", border: "border-amber-200" }
        : isKp
        ? { badge: "bg-orange-100 text-orange-800", icon: "bg-orange-50 text-orange-700", border: "border-orange-200" }
        : { badge: "bg-purple-100 text-purple-800", icon: "bg-purple-50 text-purple-700", border: "border-purple-200" };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-5">
                <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <span aria-hidden="true">←</span> Kembali
                </button>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className={`border-b ${accentClasses.border} bg-gradient-to-r from-white to-slate-50 px-6 py-7 sm:px-8`}>
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${accentClasses.badge}`}>{label}</span>
                        <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">{data.judul}</h1>
                        <p className="mt-3 text-sm text-slate-500">Informasi lengkap laporan dan dokumen pendukung mahasiswa.</p>
                    </div>
                    <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
                        <DetailItem label="Nama Mahasiswa" value={data.name} />
                        <DetailItem label="NIM" value={data.nim} />
                        <DetailItem label="Dosen Pembimbing" value={data.dosenPembimbing?.name || "-"} />
                        <DetailItem label="Nama Instansi" value={data.namaInstansi} />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Informasi Pelaksanaan</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <DetailItem label="Tanggal Mulai" value={formatDate(data.tanggalMulai)} />
                        <DetailItem label="Tanggal Selesai" value={formatDate(data.tanggalSelesai)} />
                    </div>
                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Alamat Instansi</p>
                        <p className="mt-1.5 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-800">{data.alamat || "-"}</p>
                    </div>
                </section>

                {/* Dokumen Laporan (utama) */}
                <FileCard
                    label={isPi ? "Dokumen Laporan PI" : isKp ? "Dokumen Laporan KP" : "Dokumen Laporan PLK"}
                    fileName={data.fileName}
                    filePath={data.filePath}
                    fileSize={data.fileSize}
                    fileType={data.fileType}
                    accentClasses={accentClasses}
                />

                {/* Dokumen Laporan Aktivitas (hanya PLK dan KP) */}
                {!isPi && (
                    <FileCard
                        label="Dokumen Laporan Aktivitas"
                        fileName={data.fileNameAktivitas}
                        filePath={data.filePathAktivitas}
                        fileSize={data.fileSizeAktivitas}
                        fileType={data.fileTypeAktivitas}
                        accentClasses={accentClasses}
                    />
                )}
            </div>
        </main>
    );
}
