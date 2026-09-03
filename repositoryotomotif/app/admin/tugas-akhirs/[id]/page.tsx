// app/tugas-akhirs/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

type Mahasiswa = {
    id: number;
    name: string;
    nim: string;
    urutan: number;
};

type Dosen = {
    id: number;
    name: string;
};

type Ruangan = {
    id: number;
    name: string;
};

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
};

type SDGs = {
    id: number;
    code: string;
    title: string;
};

type Keyword = {
    id: number;
    kata: string;
};

type TugasAkhirDetail = {
    id: number;
    judul: string;
    abstract: string | null;
    tahunMasuk: number;
    mataKuliahRelevan: string;
    fileName: string | null;
    filePath: string | null;
    fileSize: number | null;
    fileType: string | null;
    ruangan: Ruangan | null;
    pembimbing: Dosen;
    pembimbing2: Dosen | null;
    dosenPa: Dosen | null;
    programStudy: ProgramStudy | null;
    sdgs: SDGs[];
    mahasiswa: Mahasiswa[];
    keywords: Keyword[];
};

function formatFileSize(bytes: number | null) {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
}

const sdgColors = [
    "bg-red-500", "bg-amber-500", "bg-green-500", "bg-rose-500",
    "bg-orange-500", "bg-cyan-500", "bg-yellow-500", "bg-pink-600",
    "bg-orange-600", "bg-fuchsia-600", "bg-amber-600", "bg-lime-600",
    "bg-emerald-600", "bg-sky-600", "bg-teal-600", "bg-blue-700",
    "bg-indigo-800",
];

function sdgColor(code: string) {
    const num = parseInt(code.replace(/\D/g, ""), 10) || 1;
    return sdgColors[(num - 1) % sdgColors.length];
}

export default function DetailTugasAkhirPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { id } = use(params);

    const [data, setData] = useState<TugasAkhirDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDetail() {
            try {
                setLoading(true);
                const response = await fetch(`/api/tugas-akhirs/${id}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Gagal mengambil data tugas akhir");
                }

                setData(result);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Gagal mengambil data");
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm text-slate-500">Memuat data tugas akhir...</p>
                </div>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm text-red-600">{error || "Data tidak ditemukan"}</p>
                    </div>
                    <button
                        onClick={() => router.push("/admin/tugas-akhirs")}
                        className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                        Kembali
                    </button>
                </div>
            </main>
        );
    }

    const dosenPembimbing = [data.pembimbing, data.pembimbing2].filter(
        (d): d is Dosen => Boolean(d)
    );

    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-5xl">
                <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                    <button onClick={() => router.push("/")} className="hover:text-blue-600">
                        Beranda
                    </button>
                    <span>{'>'}</span>
                    <button onClick={() => router.push("/admin/tugas-akhirs")} className="hover:text-blue-600">
                        Tugas Akhir
                    </button>
                    <span>{'>'}</span>
                    <span className="text-slate-700">Detail Tugas Akhir</span>
                </nav>

                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Tugas Akhir</h1>
                        <p className="mt-2 text-gray-600">Informasi lengkap data Tugas Akhir</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/admin/tugas-akhirs")}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            &larr; Kembali
                        </button>
                        <button
                            onClick={() => router.push(`/admin/tugas-akhirs/${data.id}/edit`)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Edit Data
                        </button>
                    </div>
                </div>

                {/* Ringkasan */}
                <div className="mb-6 grid grid-cols-1 gap-6 rounded-xl border bg-white p-6 shadow-sm md:grid-cols-2">
                    <div className="flex gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-9 5h12a2 2 0 002-2V7.5L14.5 3H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="min-w-0 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Judul Tugas Akhir</p>
                                <p className="mt-1 font-semibold text-slate-900">{data.judul}</p>
                            </div>
                        
                            <div>
                                <p className="text-sm text-slate-500">Program Studi</p>
                                <p className="mt-1 text-slate-800">
                                    {data.programStudy ? `${data.programStudy.degree} ${data.programStudy.name}` : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Mata Kuliah Relevan</p>
                                <p className="mt-1 text-slate-800">{data.mataKuliahRelevan}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 border-slate-100 md:border-l md:pl-6">
                        <div>
                            <p className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01" />
                                </svg>
                                Ruangan
                            </p>
                            <p className="text-slate-800">{data.ruangan?.name || "Tidak ada ruangan terkait"}</p>
                        </div>

                        {data.fileName && (
                            <div>
                                <p className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-9 5h12a2 2 0 002-2V7.5L14.5 3H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    File Proposal
                                </p>
                                <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded bg-red-50 text-xs font-bold text-red-500">
                                            PDF
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{data.fileName}</p>
                                            <p className="text-xs text-slate-400">{formatFileSize(data.fileSize)}</p>
                                        </div>
                                    </div>
                                    {data.filePath && (
                                        <a
                                            href={data.filePath}
                                            download
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mahasiswa, Dosen, SDGs */}
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-3a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
                            </svg>
                            Mahasiswa
                        </h2>
                        <div className="space-y-4">
                            {data.mahasiswa.map((m) => (
                                <div key={m.id}>
                                    <p className="text-sm text-slate-500">Nama</p>
                                    <p className="mb-2 font-medium text-slate-800">{m.name}</p>
                                    <p className="text-sm text-slate-500">NIM</p>
                                    <p className="font-medium text-slate-800">{m.nim}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-9-6v6a9 9 0 0018 0v-6" />
                            </svg>
                            Dosen Pembimbing
                        </h2>
                        <div className="space-y-4">
                            {dosenPembimbing.map((dosen, index) => (
                                <div key={dosen.id}>
                                    <p className="text-sm text-slate-500">
                                        Nama {dosenPembimbing.length > 1 ? `(Pembimbing ${index + 1})` : ""}
                                    </p>
                                    <p className="font-medium text-slate-800">{dosen.name}</p>
                                </div>
                            ))}
                            <div>
                                <p className="text-sm text-slate-500">Dosen PA</p>
                                <p className="font-medium text-slate-800">{data.dosenPa?.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-blue-600">
                                <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
                            </svg>
                            SDGs Terkait
                        </h2>
                        <div className="space-y-3">
                            {data.sdgs.length === 0 ? (
                                <p className="text-sm text-slate-400">Belum ada SDGs terkait</p>
                            ) : (
                                data.sdgs.map((sdg) => (
                                    <div key={sdg.id} className="flex items-start gap-3">
                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${sdgColor(sdg.code)}`}>
                                            {sdg.code.replace(/\D/g, "")}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800">{sdg.code}</p>
                                            <p className="text-xs text-slate-500">{sdg.title}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Kata Kunci */}
                <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41L11 21l-9-9V3h9l9.59 9.41a2 2 0 010 2.83z" />
                            <circle cx="7" cy="7" r="1" />
                        </svg>
                        Kata Kunci
                    </h2>
                    {data.keywords.length === 0 ? (
                        <p className="text-sm text-slate-400">Belum ada kata kunci</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {data.keywords.map((kw) => (
                                <span
                                    key={kw.id}
                                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                >
                                    {kw.kata}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                {data.abstract && (
                            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                                    </svg>
                                    Abstrak
                                </h2>
                                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                                    {data.abstract}
                                </p>
                            </div>
                        )}

                {/* File Proposal (aksi) */}
                {data.fileName && (
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-blue-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-9 5h12a2 2 0 002-2V7.5L14.5 3H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                File Proposal
                            </h2>
                            <div className="flex gap-3">
                                {data.filePath && (
                                    <a
                                        href={data.filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Lihat File
                                    </a>
                                )}
                                {data.filePath && (
                                    <a
                                        href={data.filePath}
                                        download
                                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Unduh File
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}