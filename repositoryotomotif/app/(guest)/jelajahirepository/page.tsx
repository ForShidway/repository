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
  fileName ?: string | null;
  filePath ?: string | null;
  fileSize ?: string | null;
  fileType ?: string | null;
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
            throw new Error (
          repositoryData.message || "Gagal mengambil data repository"
            )
        }

        if(!dosenResponse.ok) {
            throw new Error (
            dosenData.message || "Gagal mengambil data dosen"
            )
        }

        if (!sdgsResponse.ok) {
            throw new Error (
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

  const filtered = useMemo(() => { let result = [...repositoryItems];
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
  }, [repositoryItems, kataKunci , prodi, tahun, dosen, sdgsFilter, sort, jenis]);

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
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-600">Memuat Repository....</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F9F9] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        <section className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">Repositori Otomotif</p>
          <h1 className="mt-3 max-w-3xl font-bold text-slate-900 text-3xl">Jelajahi Repository</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Temukan Tugas Akhir, Artikel Jurnal, dan Laporan PI dalam satu katalog repository.</p>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        

         <div className="sticky top-0 z-30 mb-6 rounded-2xl border border-slate-300 bg-white/95 p-3 backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="8"
                        />

                        <path d="m21 21-4.35-4.35" />

                    </svg>

                    <input
                        type="text"
                        value={kataKunci}
                        onChange={(e) => {
                            setKataKunci(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Cari judul, mahasiswa, NIM, mata kuliah..."
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-ring-blue-500/10"
                    />

                </div>


                {/* SORT */}

                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                >

                    <option value="terbaru">
                        Terbaru
                    </option>

                    <option value="terlama">
                        Terlama
                    </option>

                    <option value="az">
                        A–Z
                    </option>

                </select>


                {/* VIEW */}

                <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white">

                    <button
                        type="button"
                        onClick={() => setView("grid") }
                        className={`px-4 transition ${  view === "grid" ? "bg-blue-600 text-white" : "text-slate-400" }`}
                    >
                        ▦
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setView("list")
                        }
                        className={`px-4 transition ${
                            view === "list"
                                ? "bg-blue-600 text-white"
                                : "text-slate-400"
                        }`}
                    >
                        ☰
                    </button>

                </div>

            </div>

        </div>

  
        <div className="flex flex-col lg:flex-row gap-8 items-start ">
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-8">
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter Data</span>
                {(prodi || tahun || dosen || jenis || sdgsFilter.length > 0) && (
                  <button onClick={resetFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Reset Filter</button>
                )}
              </div>

              <div className="mb-5">
                <select value={jenis} onChange={e => { setJenis(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white">
                  <option value="">-- Jenis Tugas --</option>
                  <option value="TUGAS AKHIR">Tugas Akhir</option>
                  <option value="ARTIKEL JURNAL">Artikel Jurnal</option>
                  <option value="LAPORAN PI">Laporan PI</option>
                </select>
              </div>

              <div className="mb-5">
                <select value={prodi} onChange={e => { setProdi(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white">
                  <option value="">Semua Program Studi</option>
                  <option value="s1">S1 Pend. Teknik Otomotif</option>
                  <option value="d3">D3 Teknik Otomotif</option>
                </select>
              </div>


              <div className="mb-5">
                <select value={tahun} onChange={e => { setTahun(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white">
                  <option value="">Semua Tahun</option>
                  {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>


              <div className="mb-5">
                <select value={dosen} onChange={e => { setDosen(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white">
                  <option value="">Semua Dosen Pembimbing</option>
                  {dosens.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>


              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">Tag SDGs</label>
                <div className="grid grid-cols-5 gap-2">
                  {sortedSdgs.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSdg(s.id)}
                      className={`w-full rounded-lg px-2 py-2 text-[11px] font-bold transition-all ${
                        sdgsFilter.includes(s.id)
                          ? "bg-blue-600 text-white"
                          : "border border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      {s.code}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* MAIN CONTENT (Grid Cards) */}


          
          <div className="flex-1 min-w-0">
            <div className="mb-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
              </div>
              <div>
                  <p className="text-sm font-semibold text-blue-700">
                      Menampilkan {paged.length} hasil
                  </p>
                  <p className="text-sm text-slate-500">
                      dari {filtered.length} dokumen repository
                  </p>
              </div>
            </div>

            {/* Grid Cards (Gaya MahasiswaPage) */}
            {!error && paged.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-slate-600">Tidak ada dokumen yang sesuai dengan pencarian atau filter Anda.</p>
              </div>
            ) : (
              <div className= { view === "grid" ? "grid gap-6 md:grid-cols-2" : "flex flex-col gap-3"}>
     
     
     
     
     
                {paged.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => item.jenis === "TUGAS AKHIR" && router.push(`/mahasiswa/tugas-akhir/${item.sourceId}`)} 
                    className="group text-left"
                  >
                    {view === "grid" ? (
                      <div className="h-full rounded-2xl border border-slate-300 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg flex flex-col">
                        <div className="mb-4 flex items-start gap-4">
                            <ItemIcon jenis={item.jenis} />
                            <div className="flex flex-1 items-start justify-between gap-2">
                                <div className="flex flex-wrap gap-2">
                            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${item.jenis === "TUGAS AKHIR" ? "bg-blue-50 text-blue-700" : item.jenis === "ARTIKEL JURNAL" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                              {item.jenis}
                            </span>
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                              {item.programStudy ? `${item.programStudy.degree} ${item.programStudy.name}` : 'Repository Otomotif'}
                            </span>
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {item.tahun}
                              </span>
                          </div>
                          <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600 shrink-0">
                            →
                          </span>
                        </div>
                        </div>

                        <h2 className="mb-3 text-lg font-bold leading-tight text-slate-900 line-clamp-3">
                          {item.judul}
                        </h2>
                        <div className="mb-4 space-y-1 text-sm text-slate-500">
                          <p className="font-medium text-slate-700">{getMahasiswaText(item.mahasiswa) || '-'}</p>
                          <p className="line-clamp-1">{item.pembimbing ? `Pembimbing: ${item.pembimbing.name}` : item.jenis === "ARTIKEL JURNAL" ? "Artikel ilmiah mahasiswa" : "Laporan praktik mahasiswa"}</p>
                        </div>
                        {item.sdgs && item.sdgs.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {item.sdgs.map(sdgs => (
                              <span key={sdgs.id} className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
                                {sdgs.code}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-auto border-t border-slate-100 pt-5 flex items-center gap-4"> 
                          {item.filePath ? ( <>
                              <button onClick={(e) => {
                                e.stopPropagation(); setPreviewFile(item.filePath);
                              }}>
                                View
                              </button>
                              <a href={item.filePath}
                                download={item.fileName ?? true}
                                onClick={(e) => e.stopPropagation()} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
                                  Unduh
                              </a>
                            </>  
                          ) : (
                            <span className='text-sm font-semibold text-slate-300'> Belum Ada File</span>
                          ) }
                        </div>


                      </div>
                    ) : (
                      <div className='flex gap-4 rounded-xl border border-slate-300 bg-white px-5 py-4 shadow-sm transition-all hover:border-slate-400 hover:shadow-md'>
                        <ItemIcon jenis={item.jenis} />
                        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                        <div className='flex items-center justify-between gap-2'>
                          <div className='flex items-center gap-2'>
                            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${item.jenis === "TUGAS AKHIR" ? "bg-blue-50 text-blue-700" : item.jenis === "ARTIKEL JURNAL" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                              {item.jenis}
                            </span>
                            <span className='whitespace-nowrap rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700'>
                              {item.programStudy ? `${item.programStudy.degree} ${item.programStudy.name}` : "Repository Otomotif"}
                            </span>
                            <span className='whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                              {item.tahun}
                            </span>
                          </div>

                          {item.filePath ? (
                            <div className='flex items-center gap-3 shrink-0'>
                              <button
                                onClick={(e) => { e.stopPropagation(); setPreviewFile(item.filePath);  }}
                                title="Lihat" className='text-slate-400 transition hover:text-blue-600'
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                                <a href={item.filePath}
                                  download={item.fileName ?? true}
                                  onClick={(e) => e.stopPropagation()} title="unduh"
                                  className="text-slate-400 transition hover:text-slate-600">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                      <polyline points="7 10 12 15 17 10" />
                                      <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                              </a>
                            </div>
                        ) : (
                          <span className="shrink-0 text-xs font-medium text-slate-300">Belum ada file</span>
                        )}
                      </div>
                        <h2 className='text-sm font-bold text-slate-900'>
                          {item.judul}
                        </h2>
                      </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50">
                  Kembali
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPage(p)} 
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50">
                  Lanjut
                </button>
              </div>
            )}

          </div>
        </div>

        {previewFile && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4' onClick={() => setPreviewFile(null)}>
            <div className='relative h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl' onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setPreviewFile(null)} className='absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow hover:bg-slate-100'>
                X
              </button>
              <iframe src={previewFile} className='h-full w-full' title="Preview Dokumen"></iframe>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ItemIcon({ jenis }: { jenis: string }) {
    if (jenis === "TUGAS AKHIR") return (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#eff6ff" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
        </div>
    );
    if (jenis === "ARTIKEL JURNAL") return (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#f0fdf4" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        </div>
    );
    return (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#fff7ed" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        </div>
    );
}