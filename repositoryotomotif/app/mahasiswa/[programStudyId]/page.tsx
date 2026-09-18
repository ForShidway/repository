"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  FileText,
  Briefcase,
  School,
  ArrowRight,
  ArrowLeft,
  FolderOpen,
  ChevronRight,
  MousePointerClick,
  Sparkles,
} from "lucide-react";

type ProgramStudy = {
  id: number;
  name: string;
  degree: string;
  description: string | null;
};

type FolderCategory = {
  id: string;
  label: string;
  description: string;
  iconBg: string;
  gradient: string;
  borderHover: string;
  glowBg: string;
  badge: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const ALL_FOLDER_CATEGORIES: FolderCategory[] = [
  {
    id: "tugas-akhir",
    label: "Tugas Akhir",
    description: "Unggah dokumen, metadata, pembimbing, dan berkas lengkap Tugas Akhir / Skripsi.",
    iconBg: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/25",
    gradient: "from-blue-600 to-indigo-600",
    borderHover: "hover:border-blue-400 hover:shadow-blue-500/10",
    glowBg: "from-blue-500/10 to-indigo-500/5",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/80",
    Icon: GraduationCap,
  },
  {
    id: "artikel-jurnal",
    label: "Artikel Jurnal",
    description: "Unggah publikasi naskah artikel jurnal karya mahasiswa beserta metadata.",
    iconBg: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/25",
    gradient: "from-emerald-600 to-teal-600",
    borderHover: "hover:border-emerald-400 hover:shadow-emerald-500/10",
    glowBg: "from-emerald-500/10 to-teal-500/5",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
    Icon: FileText,
  },
  {
    id: "laporan-pelatihan-industri",
    label: "Laporan PI",
    description: "Upload laporan Praktik Industri (PI) yang relevan dengan bidang keahlian.",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25",
    gradient: "from-amber-500 to-orange-600",
    borderHover: "hover:border-amber-400 hover:shadow-amber-500/10",
    glowBg: "from-amber-500/10 to-orange-500/5",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
    Icon: Briefcase,
  },
  {
    id: "laporan-pelatihan-kependidikan",
    label: "Laporan PLK",
    description: "Upload laporan Pengalaman Lapangan Kependidikan (PLK) untuk prodi kependidikan.",
    iconBg: "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-violet-500/25",
    gradient: "from-violet-600 to-purple-600",
    borderHover: "hover:border-violet-400 hover:shadow-violet-500/10",
    glowBg: "from-violet-500/10 to-purple-500/5",
    badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/80",
    Icon: School,
  },
];

export default function MahasiswaProgramStudyFolderPage() {
  const params = useParams<{ programStudyId: string }>();
  const router = useRouter();
  const programStudyId = Number(params.programStudyId);

  const [programStudy, setProgramStudy] = useState<ProgramStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProgramStudy() {
      if (!programStudyId) {
        setError("Program studi tidak valid.");
        setLoading(false);
        return;
      }

      try {
        setError("");
        const response = await fetch(`/api/program-studies/${programStudyId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil data program studi");
        }

        setProgramStudy(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    fetchProgramStudy();
  }, [programStudyId]);

  function handleSelectFolder(category: FolderCategory) {
    switch (category.id) {
      case "artikel-jurnal":
        router.push(`/mahasiswa/artikel-jurnal/create/${programStudyId}`);
        break;
      case "laporan-pelatihan-industri":
        router.push(`/mahasiswa/laporan-pi/create/${programStudyId}`);
        break;
      case "laporan-pelatihan-kependidikan":
        router.push(`/mahasiswa/laporan-lpk/create/${programStudyId}`);
        break;
      case "tugas-akhir":
      default:
        router.push(
          `/mahasiswa/tugas-akhir/create/${programStudyId}?category=${encodeURIComponent(
            category.label
          )}`
        );
        break;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-8">
        <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded-xl bg-slate-200" />
          <div className="h-24 w-full rounded-2xl bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white shadow-xs" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const isD3 = programStudy?.degree?.toUpperCase() === "D3";
  const folderCategories = isD3
    ? ALL_FOLDER_CATEGORIES.filter(
        (c) => c.id === "tugas-akhir" || c.id === "laporan-pelatihan-industri"
      )
    : ALL_FOLDER_CATEGORIES;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <button
          type="button"
          onClick={() => router.push("/mahasiswa")}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition bg-white border border-slate-200 shadow-2xs px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Pilihan Program Studi</span>
        </button>

        <header className="border-b border-slate-200/80 pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200/80">
              <FolderOpen className="h-3.5 w-3.5" />
              {programStudy?.degree?.toUpperCase() || "PRODI"}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Departemen Teknik Otomotif FT UNP
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {programStudy ? `${programStudy.degree} ${programStudy.name}` : "Program Studi"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Pilih jenis folder kategori karya mahasiswa di bawah ini untuk memulai pengisian metadata dan penyerahan berkas.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">Pilih Folder Karya</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200">
                <MousePointerClick className="h-3 w-3" />
                Klik untuk membuka
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {folderCategories.map((category) => {
              const IconComponent = category.Icon;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectFolder(category)}
                  className="group relative text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
                >
                  <div className={`relative overflow-hidden rounded-2xl border-2 border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-xl active:scale-[0.99] cursor-pointer ${category.borderHover}`}>
                    {/* Top gradient accent */}
                    <span className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${category.gradient}`} />

                    {/* Subtle corner glow */}
                    <div className={`absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gradient-to-br ${category.glowBg} blur-2xl transition-all duration-500 group-hover:scale-150 pointer-events-none`} />

                    {/* Top Row: Icon + Badge + Arrow */}
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl ${category.iconBg} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-2`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <span className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase ${category.badge}`}>
                            Folder Karya
                          </span>
                        </div>
                      </div>

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/25 group-hover:scale-105">
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-black leading-snug text-slate-900 transition-colors duration-200 group-hover:text-blue-600">
                      {category.label}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Footer CTA */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        Formulir Siap
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-blue-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-700">
                        <span>Buka & Isi Formulir</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
