"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SDGs = {
    id: number;
    code: string;
    title: string;
}
type Dosen = {
    id:number;
    name: string;
}
type Ruangan = {
    id:number;
    name:string;
}
type Mahasiswa = {
    id: number;
    name: string;
    nim: string;
    urutan: number;
};

type TugasAkhir = {
    id: number;
    tahunMasuk: number;
    judul: string;
    mataKuliahRelevan: string;
    ruangan: Ruangan;
    pembimbing: Dosen;
    dosenPa: Dosen;
    mahasiswa: Mahasiswa[];
    sdgs: SDGs[];

    fileName: string | null;
    filePath: string | null;
    fileSize: number | null;
    fileType: string | null;

    createdAt: string;
    updatedAt: string;
}

export default function TugasAkhirGuestPage() {
    const [tugasAkhir, setTugasAkhir] = useState<TugasAkhir[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    useEffect(() => {
        async function fetchTugasAkhir() {
            try { 
                setLoading(true);
                setError("");
                const response = await fetch("/api/tugas-akhirs");
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(
                        data.message || "Gagal mengambil data tugas akhir"
                    )
                }
                setTugasAkhir(data);
            } catch (error) {
                console.error(error);
                setError( error instanceof Error ? error.message: "terjadi Kesalahan")
            } finally {
                setLoading(false);
            }
        } fetchTugasAkhir();
    }, []);
    const formatMahasiswa = (mahasiswa: Mahasiswa[] = []) => {
        if (!mahasiswa.length) return "-";
        return mahasiswa.map((m) => `${m.name} (${m.nim})`).join(", ");
    };

    const filteredTugasAkhir = tugasAkhir.filter((ta) => {
        const keyword = search.toLowerCase();
        const mahasiswaText = formatMahasiswa(ta.mahasiswa).toLowerCase();
        return (
            ta.judul.toLowerCase().includes(keyword) || mahasiswaText.includes(keyword)
        );
    });

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600"> Repository Otomotif</p>
                        <h1 className="mt-2 text-4xl font-bold text-slate-900">Koleksi Tugas Akhir</h1>
                        <p className="mt-3  max-w-2xl text-slate-500"> Temukan dan Jelajahi Tugas Akhir Mahasiswa Program Studi Otomotif</p>
                        <div className="mt-8 max-w-3xl">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}placeholder="cari judul..." className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pl-12 shadow-sm outline-none focud:border-blue-500 focus:ring-blue-50" />
                            </div>
                        </div>
                    
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400">
                            Repository
                        </p>
                        <h1 className="text-2xl font">
                            Semua Tugas Akhir
                        </h1>
                    </div>
                    <span className="rounded-full bg-blue-50 px-4 text-sm font-semibold text-blue-700 ">
                        {filteredTugasAkhir.length} karya
                    </span>
                </div>
                {loading && (
                    <div className="rounded-2xl border bg-white p-10 text-center ">
                        <p>
                            Memuat data tugas akhir...
                        </p>
                    </div>
                )}
                {error && (
                    <div className="rounded-1xl border border-red-200 bg-red-50 p-5 ">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}
                {!loading && !error && filteredTugasAkhir.length === 0 && (
                    <div className="rounded-2xl border bg-white p-10 text-center">
                        <p className="text-slate-500">
                            Tugas Akhir Tidak Ditemukan
                        </p>
                    </div>
                )}
                <div className="grid gap-5">
                    {filteredTugasAkhir.map((ta)=> (
                        <article key={ta.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadaw-sm hover:shadow-md ">
                            <h3 className="text-xl font-bold leading-relaxed text-slate-900"> {ta.judul} </h3>
                            <div>
                                <p className="text-slate-400">Mahasiswa</p>
                                <p className="font-semibold text-slate-700"> {formatMahasiswa(ta.mahasiswa)} </p>
                            </div>
                            <div>
                                <p className="text-slate-400">Nim</p>
                                <p className="font-semibold text-slate-700"> {ta.mahasiswa?.map((m) => m.nim).join(", ") || "-"} </p>
                            </div>
                            <div>
                                <p className="text-slate-400">Tahun Masuk</p>
                                <p className="font-semibold text-slate-700"> {ta.tahunMasuk}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Pembimbing</p>
                                <p className="font-semibold text-slate-700">{ta.pembimbing.name}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}