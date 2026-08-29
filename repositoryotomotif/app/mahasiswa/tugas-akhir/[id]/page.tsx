"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Dosen = {
  id: number;
  name: string;
};

type ProgramStudy = {
  id: number;
  name: string;
  degree: string;
};

type SDG = {
  id: number;
  code: string;
  title: string;
};

type TugasAkhir = {
  id: number;
  name: string;
  nim: string;
  tahunMasuk: number;
  judul: string;
  mataKuliahRelevan: string;
  pembimbing: Dosen;
  dosenPa: Dosen;
  programStudy: ProgramStudy;
  sdgs: SDG[];
  createdAt: string;
};

const SDG_COLORS: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D',
  5: '#FF3A21', 6: '#26BDE2', 7: '#FCC30B', 8: '#A21942',
  9: '#FD6925', 10: '#DD1367', 11: '#FD9D24', 12: '#BF8B2E',
  13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B', 16: '#00689D',
  17: '#19486A'
};

export default function DetailTugasAkhirPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [tugasAkhir, setTugasAkhir] = useState<TugasAkhir | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setError("");
        const response = await fetch(`/api/tugas-akhirs/${id}`);
        
        if (!response.ok) {
          throw new Error("Tugas Akhir tidak ditemukan");
        }

        const data = await response.json();
        setTugasAkhir(data);
      } catch (error) {
        console.error(error);
        setError(
          error instanceof Error ? error.message : "Gagal mengambil data"
        );
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-600">Memuat detail Tugas Akhir....</p>
        </div>
      </main>
    );
  }

  if (error || !tugasAkhir) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 mb-6">
            <p className="text-sm text-red-600">{error || "Tugas Akhir tidak ditemukan"}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
          >
            ← Kembali
          </button>
        </div>
      </main>
    );
  }

  const tahun = new Date(tugasAkhir.createdAt).getFullYear();

  return (
    <main className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <section className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 mb-6"
          >
            ← Kembali
          </button>
          
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">Repositori Otomotif</p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">
                {tugasAkhir.judul}
              </h1>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {tugasAkhir.programStudy?.degree || 'Program'}
            </span>
            {tugasAkhir.mataKuliahRelevan && (
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                {tugasAkhir.mataKuliahRelevan}
              </span>
            )}
          </div>
        </section>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Main Column */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              
              {/* Informasi Mahasiswa */}
              <section className="mb-8 border-b border-slate-100 pb-8">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Informasi Mahasiswa</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nama Mahasiswa</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{tugasAkhir.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">NIM</p>
                    <p className="mt-1 font-mono text-slate-700">{tugasAkhir.nim}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tahun Masuk</p>
                    <p className="mt-1 text-slate-700">{tugasAkhir.tahunMasuk}</p>
                  </div>
                </div>
              </section>

              {/* Informasi Tugas Akhir */}
              <section className="mb-8 border-b border-slate-100 pb-8">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Informasi Tugas Akhir</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Judul</p>
                    <p className="mt-2 text-slate-900 leading-relaxed">{tugasAkhir.judul}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mata Kuliah Relevan</p>
                    <p className="mt-1 text-slate-700">{tugasAkhir.mataKuliahRelevan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Program Studi</p>
                    <p className="mt-1 text-slate-700">{tugasAkhir.programStudy?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tahun</p>
                    <p className="mt-1 text-slate-700">{tahun}</p>
                  </div>
                </div>
              </section>

              {/* SDGs */}
              {tugasAkhir.sdgs && tugasAkhir.sdgs.length > 0 && (
                <section className="mb-8 border-b border-slate-100 pb-8">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">Sustainable Development Goals (SDGs)</h2>
                  <div className="flex flex-wrap gap-3">
                    {tugasAkhir.sdgs.map(sdg => (
                      <div
                        key={sdg.id}
                        className="rounded-lg px-4 py-3 text-white font-semibold text-center"
                        style={{ backgroundColor: SDG_COLORS[parseInt(sdg.code)] || '#999' }}
                      >
                        <div className="text-2xl font-bold">{sdg.code}</div>
                        <div className="text-xs mt-1">{sdg.title}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              
              <h3 className="mb-4 font-bold text-slate-900">Pembimbing & Penguji</h3>
              
              <div className="mb-6 space-y-2 border-b border-slate-100 pb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dosen Pembimbing</p>
                <p className="font-semibold text-slate-900">{tugasAkhir.pembimbing?.name || '-'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dosen Penguji</p>
                <p className="font-semibold text-slate-900">{tugasAkhir.dosenPa?.name || '-'}</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
