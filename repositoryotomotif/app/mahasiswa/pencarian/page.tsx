"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  BookOpen,
  FileText,
  Briefcase,
  School,
  ArrowUpDown,
  Filter,
  Eye,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Compass,
} from "lucide-react";

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
  jenis: "TUGAS AKHIR" | "ARTIKEL JURNAL" | "LAPORAN PI" | "LAPORAN PLK";
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

export default function PencarianMahasiswaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
          <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-16 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10" />
            ))}
          </div>
        </div>
      </main>
    }>
      <PencarianMahasiswaContent />
    </Suspense>
  );
}

function PencarianMahasiswaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [repositoryItems, setRepositoryItems] = useState<RepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Input value vs Executed Search value
  const [inputText, setInputText] = useState(searchParams.get("q") || "");
  const [executedQuery, setExecutedQuery] = useState(searchParams.get("q") || "");

  const [jenis, setJenis] = useState(searchParams.get("jenis") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "terbaru");
  const [page, setPage] = useState(1);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const PER_PAGE = 25;

  // Fetch all repository data
  useEffect(() => {
    async function fetchData() {
      try {
        setError("");
        const res = await fetch("/api/guest/repository");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil data repository");
        }

        setRepositoryItems(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Gagal memuat data pencarian");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Trigger search execution
  const handleExecuteSearch = () => {
    setExecutedQuery(inputText.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setInputText("");
    setExecutedQuery("");
    setPage(1);
  };

  const getMahasiswaText = (mahasiswa: Mahasiswa[] = []) => {
    if (!mahasiswa.length) return "";
    return mahasiswa
      .map((m) => (m.nim ? `${m.name} (${m.nim})` : m.name))
      .join(", ");
  };

  const getDetailHref = (item: RepositoryItem): string | null => {
    switch (item.jenis) {
      case "TUGAS AKHIR":
        return `/mahasiswa/tugas-akhir/${item.sourceId}`;
      case "ARTIKEL JURNAL":
        return `/mahasiswa/artikel-jurnal/${item.sourceId}`;
      case "LAPORAN PI":
        return `/mahasiswa/laporan-pi/${item.sourceId}`;
      case "LAPORAN PLK":
        return `/mahasiswa/laporan-plk/${item.sourceId}`;
      default:
        return null;
    }
  };

  // Filtered and sorted data based on executed query
  const filteredItems = useMemo(() => {
    let result = [...repositoryItems];

    if (executedQuery) {
      const q = executedQuery.toLowerCase();
      result = result.filter((item) => {
        const titleMatch = (item.judul || "").toLowerCase().includes(q);
        const mhsMatch = getMahasiswaText(item.mahasiswa).toLowerCase().includes(q);
        const pembimbingMatch = item.pembimbing?.name?.toLowerCase().includes(q);
        const jenisMatch = item.jenis.toLowerCase().includes(q);
        const prodiMatch = item.programStudy?.name?.toLowerCase().includes(q) || item.programStudy?.degree?.toLowerCase().includes(q);
        return titleMatch || mhsMatch || pembimbingMatch || jenisMatch || prodiMatch;
      });
    }

    if (jenis) {
      result = result.filter((item) => item.jenis === jenis);
    }

    if (sort === "terbaru") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "terlama") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === "az") {
      result.sort((a, b) => (a.judul || "").localeCompare(b.judul || ""));
    } else if (sort === "za") {
      result.sort((a, b) => (b.judul || "").localeCompare(a.judul || ""));
    }

    return result;
  }, [repositoryItems, executedQuery, jenis, sort]);

  const totalPages = Math.ceil(filteredItems.length / PER_PAGE);
  const pagedItems = filteredItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getJenisBadge = (itemJenis: string) => {
    switch (itemJenis) {
      case "TUGAS AKHIR":
        return {
          label: "Tugas Akhir",
          color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50",
          icon: BookOpen,
        };
      case "ARTIKEL JURNAL":
        return {
          label: "Artikel Jurnal",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50",
          icon: FileText,
        };
      case "LAPORAN PI":
        return {
          label: "Laporan PI",
          color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50",
          icon: Briefcase,
        };
      case "LAPORAN PLK":
        return {
          label: "Laporan PLK",
          color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/50",
          icon: School,
        };
      default:
        return {
          label: itemJenis,
          color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
          icon: FileText,
        };
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-16 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pb-16 pt-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-5xl space-y-7">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200/80 dark:bg-blue-950/60 dark:text-blue-400 dark:ring-blue-900/50">
                <Search className="h-3.5 w-3.5" />
                Pencarian Judul Tugas
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pencarian Dokumen & Tugas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cari dan telusuri daftar judul Tugas Akhir, Artikel Jurnal, Laporan Praktik Industri (PI), dan Pelatihan Kependidikan (PLK).
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* SEARCH BAR SECTION WITH EXPLICIT SEARCH BUTTON & ENTER TRIGGER */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-white/10 dark:bg-white/5 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteSearch();
            }}
            className="flex flex-col gap-3"
          >
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleExecuteSearch();
                    }
                  }}
                  placeholder="Ketik kata kunci judul, nama mahasiswa, NIM, topik..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#0B1220]"
                />
                {inputText && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Bersihkan pencarian"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* SEARCH EXECUTE BUTTON */}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                <Search size={16} />
                <span>Cari</span>
              </button>
            </div>

            {/* FILTER CONTROLS: JENIS DOKUMEN & SORT BY */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
              {/* Jenis Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jenis Dokumen:</span>
                <select
                  value={jenis}
                  onChange={(e) => {
                    setJenis(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <option value="">Semua Jenis</option>
                  <option value="TUGAS AKHIR">Tugas Akhir</option>
                  <option value="ARTIKEL JURNAL">Artikel Jurnal</option>
                  <option value="LAPORAN PI">Laporan PI</option>
                  <option value="LAPORAN PLK">Laporan PLK</option>
                </select>
              </div>

              {/* SORT DROPDOWN */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Urutkan:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="terlama">Terlama</option>
                  <option value="az">A–Z (Judul)</option>
                  <option value="za">Z–A (Judul)</option>
                </select>
              </div>
            </div>
          </form>
        </section>

        {/* RESULT COUNT & STATUS BANNER */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-950/20">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300">
              Menampilkan {pagedItems.length} dari {filteredItems.length} judul dokumen
              {executedQuery && (
                <span className="ml-1 font-normal text-blue-700 dark:text-blue-400">
                  untuk kata kunci &ldquo;{executedQuery}&rdquo;
                </span>
              )}
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-white/10 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-white/10">
            25 per halaman
          </span>
        </div>

        {/* LIST VIEW (PROMINENTLY DISPLAYING TITLES) */}
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-white/10 dark:bg-white/5">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
              <Search size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Tidak ada judul tugas ditemukan</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Coba gunakan kata kunci lain, atau hapus filter jenis dokumen untuk melihat semua karya.
            </p>
            {(executedQuery || jenis) && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {pagedItems.map((item, index) => {
              const itemNumber = (page - 1) * PER_PAGE + index + 1;
              const badge = getJenisBadge(item.jenis);
              const BadgeIcon = badge.icon;
              const detailHref = getDetailHref(item);
              const mhsText = getMahasiswaText(item.mahasiswa);

              return (
                <div
                  key={item.id}
                  onClick={() => detailHref && router.push(detailHref)}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md cursor-pointer dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/50"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Index Number */}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                      {itemNumber}
                    </span>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      {/* Badge Row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${badge.color}`}>
                          <BadgeIcon size={11} />
                          {badge.label}
                        </span>

                        {item.programStudy && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {item.programStudy.degree} {item.programStudy.name}
                          </span>
                        )}

                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {item.tahun}
                        </span>
                      </div>

                      {/* JUDUL TUGAS (Primary Title Display) */}
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                        {item.judul}
                      </h2>

                      {/* Sub metadata (Mahasiswa & Pembimbing) */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {mhsText && (
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            👤 {mhsText}
                          </span>
                        )}
                        {item.pembimbing && (
                          <span className="line-clamp-1">
                            🎓 Pembimbing: {item.pembimbing.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center border-t sm:border-t-0 border-slate-100 dark:border-white/5 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    {item.filePath ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(item.filePath ?? null);
                          }}
                          title="Lihat PDF"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                        >
                          <Eye size={13} />
                          <span>Lihat</span>
                        </button>
                        <a
                          href={item.filePath}
                          download={item.fileName ?? true}
                          onClick={(e) => e.stopPropagation()}
                          title="Unduh PDF"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                        >
                          <Download size={13} />
                          <span>Unduh</span>
                        </a>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Tanpa Berkas</span>
                    )}

                    {detailHref && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(detailHref);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/60"
                      >
                        <span>Detail</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION (25 PER HALAMAN) */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition ${
                  page === p
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <span>Selanjutnya</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* PDF PREVIEW MODAL */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-5 py-3.5">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Pratinjau Dokumen PDF</p>
              <button
                onClick={() => setPreviewFile(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Tutup pratinjau"
              >
                <X size={16} />
              </button>
            </div>
            <iframe src={previewFile} className="h-[calc(90vh-53px)] w-full" title="Pratinjau Dokumen" />
          </div>
        </div>
      )}
    </main>
  );
}
