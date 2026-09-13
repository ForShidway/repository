"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Dosen = { id: number; name: string };
type SDGs = { id: number; code: string; title: string };
type Ruangan = { id: number; name: string };
type Mahasiswa = { id: number; name: string; nim: string; urutan: number };
type Keyword = { id: number; kata: string };
type ProgramStudy = { id: number; name: string; degree: string };
type Penguji = {
  id: number;
  urutan: number;
  peran: "KETUA" | "SEKRETARIS" | "ANGGOTA";
  dosen: Dosen;
};

type TugasAkhirDetail = {
  id: number;
  tahunMasuk: number;
  judul: string;
  jenisPendidikan: "PENDIDIKAN" | "NON_PENDIDIKAN";
  abstract: string | null;
  mataKuliahRelevan: string | null;
  ruanganId: number | null;
  fileName: string | null;
  filePath: string | null;
  fileSize: number | null;
  fileType: string | null;
  createdAt: string;
  ruangan: Ruangan | null;
  pembimbing: Dosen;
  pembimbing2: Dosen | null;
  programStudy: ProgramStudy | null;
  mahasiswa: Mahasiswa[];
  sdgs: SDGs[];
  keywords: Keyword[];
  penguji: Penguji[];
};

/* ───────── Helpers ───────── */
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

const PERAN_LABEL: Record<string, string> = {
  KETUA: "Ketua",
  SEKRETARIS: "Sekretaris",
  ANGGOTA: "Anggota",
};

/* ── Section header sub-komponen ── */
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
  );
}

/* ───────── Main ───────── */
export default function TugasAkhirDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<TugasAkhirDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/tugas-akhirs/${params.id}`);
        const body = await res.json();
        if (!res.ok) {
          setError(body?.message ?? "Gagal mengambil data tugas akhir");
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

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-9 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </main>
    );
  }

  /* ── Error ── */
  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-500">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-bold text-red-700">{error ?? "Tugas Akhir tidak ditemukan"}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </main>
    );
  }

  const kategoriLabel = data.jenisPendidikan === "NON_PENDIDIKAN" ? "Non Kependidikan" : "Kependidikan";
  const mahasiswaLine = data.mahasiswa
    .sort((a, b) => a.urutan - b.urutan)
    .map((m) => `${m.name} (${m.nim})`)
    .join(" · ");

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-5">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="transition hover:text-blue-600">Beranda</Link>
          <span>/</span>
          <Link href="/jelajahirepository" className="transition hover:text-blue-600">Repository</Link>
          <span>/</span>
          <span className="font-medium text-slate-600">Detail Tugas Akhir</span>
        </nav>

        {/* ── Tombol Kembali ── */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
          </svg>
          Kembali
        </button>

        {/* ══════════════════════════════════════════════════════
            CARD 1 — JUDUL + META BARIS
        ══════════════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Badge Tugas Akhir */}
          <span className="mb-4 inline-block rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            Tugas Akhir
          </span>

          {/* Judul */}
          <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
            {data.judul}
          </h1>

          {/* Meta baris — mahasiswa · prodi · tahun · kategori */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
            {/* Mahasiswa */}
            {mahasiswaLine && (
              <span className="font-semibold text-slate-700">{mahasiswaLine}</span>
            )}

            {/* Separator */}
            {mahasiswaLine && <span className="text-slate-300">·</span>}

            {/* Program Studi */}
            {data.programStudy && (
              <>
                <span>{data.programStudy.degree} {data.programStudy.name}</span>
                <span className="text-slate-300">·</span>
              </>
            )}

            {/* Tahun */}
            <span>{data.tahunMasuk}</span>
            <span className="text-slate-300">·</span>

            {/* Kategori */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                data.jenisPendidikan === "NON_PENDIDIKAN"
                  ? "bg-orange-50 text-orange-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {kategoriLabel}
            </span>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            CARD 2 — ABSTRAK + KATA KUNCI
        ══════════════════════════════════════════════════════ */}
        {(data.abstract || data.keywords.length > 0) && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {data.abstract && (
              <>
                <SectionLabel label="Abstrak" />
                <p className="whitespace-pre-line leading-relaxed text-slate-700">
                  {data.abstract}
                </p>
              </>
            )}

            {data.keywords.length > 0 && (
              <div className={data.abstract ? "mt-6" : ""}>
                <SectionLabel label="Kata Kunci" />
                <div className="flex flex-wrap gap-2">
                  {data.keywords.map((k) => (
                    <span
                      key={k.id}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {k.kata}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════
            CARD 3 — TABEL DOSEN PEMBIMBING
        ══════════════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionLabel label="Dosen Pembimbing" />
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 w-8">No</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nama Dosen</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Peran</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-slate-500">1</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{data.pembimbing.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-100">
                      Pembimbing 1
                    </span>
                  </td>
                </tr>
                {data.pembimbing2 && (
                  <tr className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-slate-500">2</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{data.pembimbing2.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-100">
                        Pembimbing 2
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            CARD 4 — TABEL DOSEN PENGUJI
        ══════════════════════════════════════════════════════ */}
        {data.penguji.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionLabel label={`Dosen Penguji (${data.penguji.length} orang)`} />
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 w-8">No</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nama Dosen</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Peran</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.penguji]
                    .sort((a, b) => a.urutan - b.urutan)
                    .map((p, idx) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/60 transition ${idx < data.penguji.length - 1 ? "border-b border-slate-50" : ""}`}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-500">{p.urutan}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{p.dosen.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                              p.peran === "KETUA"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : p.peran === "SEKRETARIS"
                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {PERAN_LABEL[p.peran] ?? p.peran}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════
            CARD 5 — SDGs
        ══════════════════════════════════════════════════════ */}
        {data.sdgs.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionLabel label="Sustainable Development Goals (SDGs)" />
            <div className="flex flex-wrap gap-2">
              {data.sdgs.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50/60 px-3.5 py-2 transition hover:bg-teal-50"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-[11px] font-extrabold text-white shadow-sm">
                    {s.code}
                  </span>
                  <span className="text-xs font-semibold text-teal-800">{s.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════
            CARD 6 — DOKUMEN / FILE
        ══════════════════════════════════════════════════════ */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionLabel label="Berkas Tugas Akhir" />

          {data.fileName && data.filePath ? (
            <>
              {/* File info */}
              <div className="mb-5 flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                    <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{data.fileName}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                    {data.fileSize != null && <span>{formatBytes(data.fileSize)}</span>}
                    {data.fileType && (
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 font-bold text-slate-600">
                        {formatFileType(data.fileType)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tombol aksi */}
              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Lihat */}
                <button
                  onClick={() => setPreviewFile(data.filePath)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                  Lihat Dokumen
                </button>

                {/* Unduh */}
                <a
                  href={data.filePath}
                  download={data.fileName}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-300"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Unduh Dokumen
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-400">Belum ada dokumen yang diunggah</p>
            </div>
          )}
        </section>

      </div>

      {/* ══ PREVIEW MODAL ══ */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <p className="text-sm font-bold text-slate-800">Preview Dokumen</p>
              <button
                onClick={() => setPreviewFile(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <iframe src={previewFile} className="h-[calc(90vh-53px)] w-full" title="Preview Dokumen" />
          </div>
        </div>
      )}
    </main>
  );
}
