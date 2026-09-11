"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type TipePenulis = "MAHASISWA" | "DOSEN" | "LAINNYA"

type Dosen = {
    id:number;
    name: string;
}

type Penulis = {
    id: number;
    tipe: TipePenulis;
    nama: string;
    nim: string | null
    urutan : number;
    dosen: Dosen | null
}

type Keyword = { id: number; kata: string};

type ArtikelJurnalDetail = {
    id: number;
    tahun: number;
    judul: string;
    abstract: string;
    fileName: string | null;
    filePath: string | null;
    fileSize: number | null;
    fileType: string | null;
    createdAt: string;
    programStudy: { id: number; name: string; degree: string } | null;
    keywords: Keyword[];
    penulis: Penulis[];
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileType(fileType: string | null) {
  if (!fileType) return "";
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("wordprocessingml")) return "DOCX";
  if (fileType.includes("msword")) return "DOC";
  return fileType.split("/").pop()?.toUpperCase() ?? "";
}


function formatTanggal(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function namaPenulis(p: Penulis) {
  return p.tipe === "DOSEN" ? p.dosen?.name ?? "-" : p.nama;
}

export default function ArtikelJurnalDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ArtikelJurnalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/artikel-jurnal/${params.id}`);
        const body = await res.json();
        if (!res.ok) {
          setError(body?.message ?? "Gagal mengambil data artikel jurnal");
          return;
        }
        setData(body);
      } catch {
        setError("Tidak dapat terhubung ke server");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchDetail();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p className="text-sm text-slate-500">Memuat data...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p className="text-sm text-red-500">{error ?? "Artikel jurnal tidak ditemukan"}</p>
      </main>
    );
  }

  const namaAuthorsLine = data.penulis.map((p) => namaPenulis(p)).join(", ");

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        {/* KOLOM KIRI */}
        <div className="space-y-6 lg:col-span-2">
          {/* JUDUL */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              {data.programStudy && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {data.programStudy.degree} · {data.programStudy.name}
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Tahun {data.tahun}
              </span>
            </div>
            <h1 className="text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
              {data.judul}
            </h1>
          </div>

          {/* ABSTRAK */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Abstrak
            </p>
            <p className="whitespace-pre-line leading-relaxed text-slate-700">
              {data.abstract}
            </p>

            {data.keywords.length > 0 && (
              <>
                <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Kata Kunci
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.keywords.map((k) => (
                    <span
                      key={k.id}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {k.kata}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          {/* PENULIS */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Penulis — {data.penulis.length} Orang
            </p>
            <div className="space-y-4">
              {data.penulis.map((p, index) => (
                <div key={p.id} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-sm font-semibold text-slate-600">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">{namaPenulis(p)}</p>
                    
                    </div>
                    {p.tipe === "MAHASISWA" && p.nim && (
                      <p className="text-xs text-slate-400">{p.nim}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BERKAS */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Berkas Artikel
            </p>
            {data.fileName && data.filePath ? (
              <>
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path
                        d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {data.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {data.fileSize != null && <span>{formatBytes(data.fileSize)}</span>}
                      {data.fileType && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">
                          {formatFileType(data.fileType)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                 < a href={data.filePath}
                  download={data.fileName}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Unduh Berkas
                </a>
              </>
            ) : (
              <p className="text-sm text-slate-400">Tidak ada berkas</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}