"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderCheck,
  Search,
  PlusCircle,
  Eye,
  Download,
  ArrowRight,
  Filter,
  Sparkles,
  X,
  Upload,
  BookOpen,
  FileText,
  Briefcase,
  School,
  ChevronLeft,
  ChevronRight,
  User,
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
  jenis: "TUGAS AKHIR" | "ARTIKEL JURNAL" | "LAPORAN PI" | "LAPORAN PLK" | "LAPORAN KP";
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

type UserSession = {
  id: number | string;
  email: string;
  name: string;
  role: string;
};

export default function TugasSayaMahasiswaPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [repositoryItems, setRepositoryItems] = useState<RepositoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [kataKunci, setKataKunci] = useState("");
  const [jenis, setJenis] = useState("");
  const [sort, setSort] = useState("terbaru");
  const [page, setPage] = useState(1);
  const [filterOnlyMine, setFilterOnlyMine] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const PER_PAGE = 12;

  useEffect(() => {
    async function initData() {
      try {
        setError("");
        const [sessionRes, repoRes] = await Promise.all([
          fetch("/api/auth/session", { cache: "no-store" }),
          fetch("/api/guest/repository"),
        ]);

        if (sessionRes.ok) {
          const sData = await sessionRes.json();
          setCurrentUser(sData.user ?? null);
        }

        if (repoRes.ok) {
          const rData = await repoRes.json();
          setRepositoryItems(rData);
        } else {
          const errData = await repoRes.json();
          throw new Error(errData.message || "Gagal mengambil data tugas repositori");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Gagal memuat tugas");
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

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
      case "LAPORAN KP":
        return `/mahasiswa/laporan-kp/${item.sourceId}`;
      default:
        return null;
    }
  };

  // Check if item belongs to current user
  const isMyItem = (item: RepositoryItem) => {
    if (!currentUser) return true;
    const userName = (currentUser.name || "").toLowerCase().trim();
    const userEmailPrefix = (currentUser.email || "").split("@")[0].toLowerCase().trim();

    // Check in mahasiswa list
    return item.mahasiswa.some((m) => {
      const mName = (m.name || "").toLowerCase().trim();
      const mNim = (m.nim || "").toLowerCase().trim();
      return (
        mName.includes(userName) ||
        userName.includes(mName) ||
        mNim.includes(userEmailPrefix) ||
        userEmailPrefix.includes(mNim)
      );
    });
  };

  const filteredItems = useMemo(() => {
    let result = [...repositoryItems];

    // If filterOnlyMine is active and we have user matching items
    if (filterOnlyMine && currentUser) {
      const myItems = result.filter(isMyItem);
      // If user has items, show them. If no items match yet, we keep myItems (which will show clean empty upload state)
      result = myItems;
    }

    if (kataKunci) {
      const lq = kataKunci.toLowerCase();
      result = result.filter((t) => {
        const mahasiswaText = getMahasiswaText(t.mahasiswa).toLowerCase();
        return (
          t.judul.toLowerCase().includes(lq) ||
          mahasiswaText.includes(lq) ||
          t.jenis.toLowerCase().includes(lq)
        );
      });
    }

    if (jenis) {
      result = result.filter((t) => t.jenis === jenis);
    }

    if (sort === "terbaru") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "terlama") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === "az") {
      result.sort((a, b) => (a.judul || "").localeCompare(b.judul || ""));
    }

    return result;
  }, [repositoryItems, filterOnlyMine, currentUser, kataKunci, jenis, sort]);

  const totalPages = Math.ceil(filteredItems.length / PER_PAGE);
  const pagedItems = filteredItems.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-16 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pb-16 pt-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Daftar Tugas & Berkas Saya
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Kelola dan pantau seluruh dokumen Tugas Akhir, Artikel Jurnal, Laporan PI, dan PLK yang telah Anda unggah.
            </p>
          </div>

          {/* New Submission CTA */}
          <Link
            href="/mahasiswa"
            className="inline-flex items-center gap-2 self-start sm:self-center whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Unggah Dokumen Baru</span>
          </Link>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Toolbar: Search, Filter Jenis, Sort, & My/All Toggle */}
        <section className="sticky top-[68px] z-30 rounded-2xl border border-slate-200 bg-white/95 p-3 sm:p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#0B1220]/90">
          <div className="flex flex-col gap-3">
            {/* Search input */}
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input
                type="text"
                value={kataKunci}
                onChange={(e) => {
                  setKataKunci(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari judul tugas, kata kunci..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {/* Filter Controls: Jenis Dokumen Dropdown, Sort, & My/All Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
              {/* Jenis Dokumen Dropdown */}
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
                  <option value="LAPORAN KP">Laporan Kerja Praktek</option>
                </select>
              </div>

              {/* Right side: Sort + My/All toggle */}
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
                </select>

                
              </div>
            </div>
          </div>
        </section>

        {/* Count banner */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 dark:border-blue-900/30 dark:bg-blue-950/20">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300">
              Menampilkan {pagedItems.length} dari {filteredItems.length} dokumen
              {filterOnlyMine ? " milik Anda" : ""}
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {repositoryItems.length} total dokumen di sistem
          </span>
        </div>

        {/* GRID VIEW (WITHOUT THE BIG SVG ICON BOX AS REQUESTED) */}
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-white/10 dark:bg-white/5">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <FolderCheck size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {filterOnlyMine ? "Belum ada tugas yang Anda unggah" : "Tidak ada dokumen ditemukan"}
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
              {filterOnlyMine
                ? "Anda belum mengunggah berkas karya tugas akhir, artikel jurnal, atau laporan magang. Silakan unggah karya Anda sekarang atau lihat semua tugas."
                : "Coba ubah kata kunci atau filter pencarian Anda."}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/mahasiswa"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                <Upload size={14} />
                <span>Mulai Unggah Dokumen</span>
              </Link>
              {filterOnlyMine && (
                <button
                  type="button"
                  onClick={() => setFilterOnlyMine(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  Lihat Semua Dokumen
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pagedItems.map((item) => {
              const detailHref = getDetailHref(item);
              const mhsText = getMahasiswaText(item.mahasiswa);

              return (
                <div
                  key={item.id}
                  onClick={() => detailHref && router.push(detailHref)}
                  className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg cursor-pointer dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/40"
                >
                  {/* Top metadata tags & link arrow (NO BIG ICON BOX) */}
                  <div className="mb-3.5 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                          item.jenis === "TUGAS AKHIR"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                            : item.jenis === "ARTIKEL JURNAL"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : item.jenis === "LAPORAN PI"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                            : item.jenis === "LAPORAN PLK"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400"
                            : "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400"
                        }`}
                      >
                        {item.jenis}
                      </span>

                      {item.programStudy && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {item.programStudy.degree} {item.programStudy.name}
                        </span>
                      )}

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {item.tahun}
                      </span>
                    </div>

                    <ArrowRight
                      size={16}
                      className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-slate-600 dark:group-hover:text-blue-400"
                    />
                  </div>

                  {/* Judul Tugas */}
                  <h2 className="mb-3 text-sm sm:text-base font-bold leading-snug text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors line-clamp-3">
                    {item.judul}
                  </h2>

                  {/* Mahasiswa & Pembimbing Info */}
                  <div className="mb-4 space-y-1 text-xs sm:text-sm">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {mhsText || "–"}
                    </p>
                    <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.pembimbing
                        ? `Pembimbing: ${item.pembimbing.name}`
                        : item.jenis === "ARTIKEL JURNAL"
                        ? "Artikel ilmiah mahasiswa"
                        : "Laporan praktik mahasiswa"}
                    </p>
                  </div>

                  {/* SDGs Tags */}
                  {item.sdgs && item.sdgs.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {item.sdgs.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                        >
                          {s.code}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Actions: File buttons & Detail link */}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3.5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      {item.filePath ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile(item.filePath ?? null);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-950/70"
                          >
                            <Eye size={12} />
                            <span>Lihat</span>
                          </button>
                          <a
                            href={item.filePath}
                            download={item.fileName ?? true}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                          >
                            <Download size={12} />
                            <span>Unduh</span>
                          </a>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Belum ada file</span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-blue-600 group-hover:underline dark:text-blue-400">
                      Lihat Detail →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
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
