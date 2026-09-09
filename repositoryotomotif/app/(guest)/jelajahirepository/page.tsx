"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- TYPE DEFINITIONS ---
type Dosen = {
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

type Mahasiswa = {
  id: number;
  name: string;
  nim: string;
  urutan: number;
};

type RepositoryItem = {
  id: string;
  sourceId: number;
  jenis: "TUGAS AKHIR" | "ARTIKEL JURNAL" | "LAPORAN PI";
  tahun: number;
  judul: string;
  pembimbing: Dosen | null;
  programStudy: ProgramStudy | null;
  mahasiswa: Mahasiswa[];
  sdgs: SDGs[];
  createdAt: string;
  fileName?: string | null;
  filePath?: string | null;
  fileSize?: string | null;
  fileType?: string | null;
};

export default function KatalogTugasAkhirPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [repositoryItems, setRepositoryItems] = useState<RepositoryItem[]>([]);
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [sdgs, setSdgs] = useState<SDGs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kataKunci, setKataKunci] = useState(searchParams.get('kataKunci') || '');
  const [prodi, setProdi] = useState(searchParams.get('prodi') || '');
  const [tahun, setTahun] = useState('');
  const [dosen, setDosen] = useState('');
  const [sdgsFilter, setSdgsFilter] = useState<number[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState('terbaru');
  const [page, setPage] = useState(1);
  const [jenis, setJenis] = useState(searchParams.get('jenis') || '')
  const [previewFile, setPreviewFile] = useState<string | null | undefined>(null);
  const PER_PAGE = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        setError("");
        const [repositoryResponse, dosenResponse, sdgsResponse] = await Promise.all([
          fetch("/api/guest/repository"),
          fetch("/api/dosens"),
          fetch("/api/sdgs")
        ]);

        const repositoryData = await repositoryResponse.json();
        const dosenData = await dosenResponse.json();
        const sdgsData = await sdgsResponse.json();

        if (!repositoryResponse.ok) {
          throw new Error(
            repositoryData.message || "Gagal mengambil data repository"
          )
        }

        if (!dosenResponse.ok) {
          throw new Error(
            dosenData.message || "Gagal mengambil data dosen"
          )
        }

        if (!sdgsResponse.ok) {
          throw new Error(
            sdgsData.message || "Gagal mengambil data SDGS"
          )
        }

        setRepositoryItems(repositoryData);
        setDosens(dosenData);
        setSdgs(sdgsData);

      } catch (error) {
        console.error(error);
        setError(
          error instanceof Error ? error.message : "Gagal Mengambil data"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  const TAHUN_OPTIONS = Array.from(new Set(repositoryItems.map((item) => item.tahun))).sort((a, b) => b - a);

  // Sort SDGs berdasarkan code numerik (1, 2, 3, ... bukan 1, 10, 11)
  const sortedSdgs = useMemo(() => {
    return [...sdgs].sort((a, b) => {
      const numA = parseInt(a.code.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.code.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [sdgs]);

  const getMahasiswaText = (mahasiswa: Mahasiswa[] = []) => {
    if (!mahasiswa.length) return "";
    return mahasiswa.map((m) => `${m.name} (${m.nim})`).join(" ");
  };

  const filtered = useMemo(() => {
    let result = [...repositoryItems];
    if (kataKunci) {
      const lq = kataKunci.toLowerCase();
      result = result.filter(t => {
        const mahasiswaText = getMahasiswaText(t.mahasiswa).toLowerCase();
        return t.judul.toLowerCase().includes(lq) || mahasiswaText.includes(lq) || t.jenis.toLowerCase().includes(lq);
      });
    }

    if (jenis) {
      result = result.filter(t => t.jenis === jenis);
    }

    if (prodi) {
      result = result.filter(
        t => t.programStudy?.degree?.toLowerCase() === prodi.toLowerCase()
      );
    }
    if (tahun) {
      result = result.filter(
        t => t.tahun.toString() === tahun
      );
    }
    if (dosen) {
      result = result.filter(
        t => t.pembimbing?.id.toString() === dosen
      );
    }
    if (sdgsFilter.length > 0) {
      result = result.filter(t =>
        sdgsFilter.every(filterId => t.sdgs?.some(s => s.id === filterId))
      );
    }
    if (sort === 'terbaru') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sort === 'terlama') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    if (sort === 'az') {
      result.sort((a, b) => a.judul.localeCompare(b.judul));
    }
    return result;
  }, [repositoryItems, kataKunci, prodi, tahun, dosen, sdgsFilter, sort, jenis]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSdg(id: number) {
    setSdgsFilter(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setPage(1);
  }

  function resetFilters() {
    setKataKunci(''); setProdi(''); setTahun(''); setDosen(''); setSdgsFilter([]); setJenis('');
    setPage(1);
    router.replace('/mahasiswa/tugas-akhir/katalog', { scroll: false });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="skeleton mb-3 h-4 w-36 rounded" />
            <div className="skeleton mb-2 h-8 w-64 rounded" />
            <div className="skeleton h-4 w-96 rounded" />
          </div>
          <div className="skeleton mb-6 h-14 w-full rounded-2xl" />
          <div className="flex gap-8">
            <div className="skeleton h-96 w-72 shrink-0 rounded-2xl" />
            <div className="flex-1 grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-56 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <section className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Repositori Otomotif</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Jelajahi Repository</h1>
          <p className="mt-2 max-w-2xl text-slate-500">Temukan Tugas Akhir, Artikel Jurnal, dan Laporan PI dalam satu katalog repository.</p>
        </section>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <svg className="mt-0.5 shrink-0 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Search + Sort + View toolbar */}
        <div className="sticky top-[68px] z-30 mb-6 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-md shadow-slate-900/5 backdrop-blur-md">
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={kataKunci}
                onChange={(e) => { setKataKunci(e.target.value); setPage(1); }}
                placeholder="Cari judul, mahasiswa, NIM, mata kuliah..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            {/* SORT */}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="az">A–Z</option>
            </select>

            {/* VIEW TOGGLE */}
            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setView("grid")}
                title="Grid view"
                className={`flex items-center justify-center px-4 py-2.5 transition ${view === "grid" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                title="List view"
                className={`flex items-center justify-center px-4 py-2.5 transition ${view === "list" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-7 items-start">
          {/* ── SIDEBAR FILTER ── */}
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-[140px]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  <span className="text-sm font-bold text-slate-800">Filter Data</span>
                </div>
                {(prodi || tahun || dosen || jenis || sdgsFilter.length > 0) && (
                  <button onClick={resetFilters} className="text-xs font-bold text-red-500 hover:text-red-700 transition">
                    Reset
                  </button>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Jenis */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Dokumen</label>
                  <select value={jenis} onChange={e => { setJenis(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 cursor-pointer">
                    <option value="">Semua Jenis</option>
                    <option value="TUGAS AKHIR">Tugas Akhir</option>
                    <option value="ARTIKEL JURNAL">Artikel Jurnal</option>
                    <option value="LAPORAN PI">Laporan PI</option>
                  </select>
                </div>

                {/* Prodi */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Program Studi</label>
                  <select value={prodi} onChange={e => { setProdi(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 cursor-pointer">
                    <option value="">Semua Program Studi</option>
                    <option value="s1">S1 Pend. Teknik Otomotif</option>
                    <option value="d3">D3 Teknik Otomotif</option>
                  </select>
                </div>

                {/* Tahun */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Tahun</label>
                  <select value={tahun} onChange={e => { setTahun(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 cursor-pointer">
                    <option value="">Semua Tahun</option>
                    {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Dosen */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Dosen Pembimbing</label>
                  <select value={dosen} onChange={e => { setDosen(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 cursor-pointer">
                    <option value="">Semua Dosen</option>
                    {dosens.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                {/* SDGs */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tag SDGs</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {sortedSdgs.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSdg(s.id)}
                        title={s.title}
                        className={`w-full rounded-lg py-2 text-[11px] font-bold transition-all ${sdgsFilter.includes(s.id)
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          }`}
                      >
                        {s.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT (Grid Cards) */}



          <div className="flex-1 min-w-0">
            {/* Result count banner */}
            <div className="mb-5 flex items-center gap-4 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">
                  Menampilkan {paged.length} dari {filtered.length} dokumen
                </p>
                <p className="text-xs text-slate-500">
                  {repositoryItems.length} total dokumen dalam repository
                </p>
              </div>
            </div>

            {/* Empty state */}
            {!error && paged.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
                <p className="font-bold text-slate-700">Tidak ada dokumen ditemukan</p>
                <p className="mt-1 text-sm text-slate-400">Coba ubah kata kunci atau filter pencarian Anda.</p>
              </div>
            ) : (
              <div className={view === "grid" ? "grid gap-5 md:grid-cols-2" : "flex flex-col gap-3"}>
                {paged.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => item.jenis === "TUGAS AKHIR" && router.push(`/mahasiswa/tugas-akhir/${item.sourceId}`)}
                    className="group cursor-pointer text-left"
                  >
                    {view === "grid" ? (
                      <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
                        <div className="mb-4 flex items-start gap-4">
                          <ItemIcon jenis={item.jenis} />
                          <div className="flex flex-1 items-start justify-between gap-2">
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${item.jenis === "TUGAS AKHIR" ? "bg-blue-50 text-blue-700"
                                : item.jenis === "ARTIKEL JURNAL" ? "bg-emerald-50 text-emerald-700"
                                  : "bg-orange-50 text-orange-700"
                                }`}>
                                {item.jenis}
                              </span>
                              {item.programStudy && (
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                  {item.programStudy.degree} {item.programStudy.name}
                                </span>
                              )}
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                {item.tahun}
                              </span>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        <h2 className="mb-3 text-sm font-bold leading-snug text-slate-900 line-clamp-3">
                          {item.judul}
                        </h2>
                        <div className="mb-4 space-y-1 text-sm">
                          <p className="font-semibold text-slate-800">{getMahasiswaText(item.mahasiswa) || '–'}</p>
                          <p className="line-clamp-1 text-slate-500">
                            {item.pembimbing ? `Pembimbing: ${item.pembimbing.name}` : item.jenis === "ARTIKEL JURNAL" ? "Artikel ilmiah mahasiswa" : "Laporan praktik mahasiswa"}
                          </p>
                        </div>

                        {item.sdgs && item.sdgs.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {item.sdgs.map(s => (
                              <span key={s.id} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                {s.code}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4">
                          {item.filePath ? (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setPreviewFile(item.filePath); }}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                Lihat
                              </button>
                              <a
                                href={item.filePath}
                                download={item.fileName ?? true}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                Unduh
                              </a>
                            </>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Belum ada file</span>
                          )}
                        </div>


                      </div>
                    ) : (
                      <div className="flex gap-5 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                        <div className="flex w-16 shrink-0 items-center justify-center self-center">
                          <ItemIcon jenis={item.jenis} small />
                        </div>

                        {/* KOLOM 2: KONTEN */}
                        <div className="flex flex-1 min-w-0 items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                              <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${item.jenis === "TUGAS AKHIR" ? "bg-blue-50 text-blue-700"
                                : item.jenis === "ARTIKEL JURNAL" ? "bg-emerald-50 text-emerald-700"
                                  : "bg-orange-50 text-orange-700"
                                }`}>{item.jenis}</span>
                              {item.programStudy && (
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                  {item.programStudy.degree} {item.programStudy.name}
                                </span>
                              )}
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{item.tahun}</span>
                            </div>

                            <h2 className="mb-1.5 text-sm font-bold leading-snug text-slate-900 line-clamp-2">{item.judul}</h2>

                            {getMahasiswaText(item.mahasiswa) && (
                              <p className="mb-1 text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">{getMahasiswaText(item.mahasiswa)}</span>
                              </p>
                            )}

                            {item.sdgs && item.sdgs.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {item.sdgs.map(s => (
                                  <span key={s.id} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                    {s.code}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* KANAN: aksi — eye/download di atas, Lihat Detail di bawah/tengah */}
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            {item.filePath ? (
                              <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setPreviewFile(item.filePath); }} title="Lihat" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-blue-300 hover:text-blue-600">
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                </button>
                                <a href={item.filePath} download={item.fileName ?? true} onClick={(e) => e.stopPropagation()} title="Unduh" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-blue-300 hover:text-blue-600">
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                </a>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300">Belum ada file</span>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                item.jenis === "TUGAS AKHIR" && router.push(`/mahasiswa/tugas-akhir/${item.sourceId}`);
                              }}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                            >
                              Lihat Detail
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  ← Kembali
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${page === p ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Lanjut →
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setPreviewFile(null)}>
            <div className="relative h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <p className="text-sm font-bold text-slate-800">Preview Dokumen</p>
                <button onClick={() => setPreviewFile(null)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <iframe src={previewFile} className="h-[calc(90vh-53px)] w-full" title="Preview Dokumen" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ItemIcon({ jenis, small = false }: { jenis: string; small?: boolean }) {
  const size = small ? "h-12 w-12" : "h-14 w-14";
  const iconSize = small ? 24 : 28;
  if (jenis === "TUGAS AKHIR") return (
    <div className={`${size} rounded-2xl flex items-center justify-center shrink-0 bg-blue-50`}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    </div>
  );
  if (jenis === "ARTIKEL JURNAL") return (
    <div className={`${size} rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50`}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    </div>
  );
  return (
    <div className={`${size} rounded-2xl flex items-center justify-center shrink-0 bg-orange-50`}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    </div>
  );
}