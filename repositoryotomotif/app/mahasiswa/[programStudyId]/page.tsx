"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
};

const ALL_FOLDER_CATEGORIES: FolderCategory[] = [
  {
    id: "tugas-akhir",
    label: "Tugas Akhir",
    description: "Unggah dokumen dan data tugas akhir mahasiswa.",
  },
  {
    id: "artikel-jurnal",
    label: "Artikel Jurnal",
    description: "Unggah dokumen artikel jurnal.",
  },
  {
    id: "laporan-pelatihan-industri",
    label: "Laporan Pi",
    description: "Upload laporan praktik yang relevan dengan program studi.",
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
      case "artikel-jurnal": router.push(`/mahasiswa/artikel-jurnal/create/${programStudyId}`); break;
      case "laporan-pelatihan-industri": router.push(`/mahasiswa/laporan-pi/create/${programStudyId}`); break;
      case "tugas-akhir":
        default: router.push(`/mahasiswa/tugas-akhir/create/${programStudyId}?category=${encodeURIComponent(category.label)}`); break;
    }

  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <p>Memuat folder program studi...</p>
        </div>
      </main>
    );
  }

   const isD3 = programStudy?.degree?.toUpperCase() === "D3";
    const folderCategories = isD3
        ? ALL_FOLDER_CATEGORIES.filter((c) => c.id === "tugas-akhir")
        : ALL_FOLDER_CATEGORIES;

  return (
    <main className="min-h-screen bg-[#F4F9F9] px-8 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => router.push("/mahasiswa")}
          className="mb-6 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Kembali ke Program Studi
        </button>

        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Repositori Otomotif
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            {programStudy ? `${programStudy.degree} ${programStudy.name}` : "Program Studi"}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Pilih jenis dokumen yang ingin Anda kelola untuk program studi ini.
          </p>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-3">
          {folderCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelectFolder(category)}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-blue-700">
                  Folder
                </span>
                <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                  →
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{category.label}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">{category.description}</p>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-blue-600">Buka folder</span>
              </div>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
