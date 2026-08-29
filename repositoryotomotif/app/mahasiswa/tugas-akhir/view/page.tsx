"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 1. Definisikan tipe data sesuai dengan Schema Prisma Anda
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
  name: string; // Nama Mahasiswa
  nim: string;
  tahunMasuk: number;
  judul: string;
  mataKuliahRelevan: string;
  pembimbing: Dosen;
  programStudy: ProgramStudy;
  sdgs: SDG[];
  createdAt: string;
};

// Data statis untuk SDGs (sebagai warna/styling tambahan sesuai template)
const SDG_COLORS: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D',
  5: '#FF3A21', 6: '#26BDE2', 7: '#FCC30B', 8: '#A21942',
  9: '#FD6925', 10: '#DD1367', 11: '#FD9D24', 12: '#BF8B2E',
  13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B', 16: '#00689D',
  17: '#19486A'
};

export default function DaftarTugasAkhirPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk menyimpan data dari database
  const [tugasAkhirs, setTugasAkhirs] = useState<TugasAkhir[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mengambil data Tugas Akhir dari API
  useEffect(() => {
    async function fetchTugasAkhirs() {
      try {
        const response = await fetch("/api/tugas-akhirs");
        if (!response.ok) throw new Error("Gagal mengambil data Tugas Akhir");
        
        const data = await response.json();
        setTugasAkhirs(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data repository");
      } finally {
        setLoading(false);
      }
    }
    fetchTugasAkhirs();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // Navigasi ke halaman pencarian dengan query (Bisa disesuaikan route-nya)
    router.push(`/mahasiswa/tugas-akhir?q=${searchQuery}`);
  }

  // Ambil 6 TA terbaru untuk ditampilkan di beranda
  const recentTas = tugasAkhirs.slice(0, 6);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #16367F 0%, #1E4FBA 60%, #2d6de8 100%)' }}
      >
        <div className="absolute inset-0 gear-bg opacity-30 [background-size:140px_140px]"></div>
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,99,10,0.15) 0%, transparent 70%)' }}></div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.12)', color: '#A8BDE8' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#F0B429]"></span>
            Fakultas Teknik · Universitas Negeri Padang
          </div>
          <h1 className="mx-auto mb-5 max-w-4xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Repository Tugas Akhir<br />
            <span style={{ color: '#F0B429' }}>Teknik Otomotif</span> UNP
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base sm:text-lg" style={{ color: '#A8BDE8' }}>
            Platform digital terpusat untuk menemukan, menyimpan, dan mengeksplorasi seluruh karya ilmiah mahasiswa Teknik Otomotif.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="relative flex items-center">
              <svg className="absolute left-4 text-[#9AA0A6]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari judul, penulis, kata kunci..."
                className="w-full rounded-2xl bg-white py-4 pl-12 pr-36 text-sm font-medium text-[#1a1f2e] focus:outline-none focus:ring-2 focus:ring-[#E8630A]"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
              />
              <button
                type="submit"
                className="absolute right-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#E8630A' }}
              >
                Cari TA
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* TA Terbaru Section */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold" style={{ color: '#16367F' }}>Tugas Akhir Terbaru</h2>
          <button onClick={() => router.push('/mahasiswa/tugas-akhir/semua')} className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80" style={{ color: '#E8630A' }}>
            Lihat semua <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Memuat data repository...</div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 py-10 text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentTas.length === 0 ? (
              <p className="col-span-3 text-center text-gray-500">Belum ada Tugas Akhir yang diunggah.</p>
            ) : (
              recentTas.map(ta => (
                <button
                  key={ta.id}
                  onClick={() => router.push(`/mahasiswa/tugas-akhir/${ta.id}`)}
                  className="group relative flex flex-col rounded-2xl bg-white p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ boxShadow: '0 2px 16px rgba(30,79,186,0.05)' }}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: '#EEF2FB', color: '#1E4FBA' }}>
                      {ta.programStudy?.degree || 'Program'}
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: '#FFF4EC', color: '#E8630A' }}>
                      {ta.mataKuliahRelevan || 'Umum'}
                    </span>
                  </div>
                  
                  <h3 className="mb-4 line-clamp-3 font-display text-sm font-semibold leading-relaxed transition-colors group-hover:text-[#1E4FBA]" style={{ color: '#16367F' }}>
                    {ta.judul}
                  </h3>
                  
                  <div className="mt-auto space-y-2 text-xs" style={{ color: '#9AA0A6' }}>
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {ta.name} ({ta.nim})
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Angkatan {ta.tahunMasuk} · {ta.pembimbing?.name || 'Tidak ada pembimbing'}
                    </div>
                  </div>

                  {ta.sdgs && ta.sdgs.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1 border-t border-gray-100 pt-4">
                      {ta.sdgs.map(sdg => (
                        <span key={sdg.id} className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: SDG_COLORS[sdg.id] || '#16367F' }}>
                          SDG {sdg.code}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}