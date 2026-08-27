"use client"

import { useEffect, useState } from "react";
import Link from "next/link";

type Dosen = {
    id: number;
    name: string;
}
type SDGs = {
    id: number;
    code: string;
    title: string
}
type Ruangan = {
    id: number,
    name: string
}
type TugasAkhir = {
    id: number;
    name: string;
    tahunMasuk: number;
    nim : string;
    judul: string,
    mataKuliahRelevan: string;
    ruangan: Ruangan;
    pembimbing: Dosen;
    dosenPa: Dosen;
    sdgs: SDGs[];
}
type HomeData = {
    statistics: { totalTugasAkhir:number; totalDosen:number; totalRuangan:number; totalSDGs:number;}
    tugasAkhirTerbaru:TugasAkhir[]
}

export default function GuestHomePage() {
    const [data, setData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        async function fecthHomeData() {
            try{
                setLoading(true);
                const response = await fetch("/api/guest/home");
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(
                        result.message || "Gagal mengambil data"
                    );
                }
                setData(result);
            } catch (error) {
                console.error(error);
                setError(
                    error instanceof Error ? error.message : "Terjadi Kesalahan"
                );
            } finally {
                setLoading(false);
            }
        }
        fecthHomeData();
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-[calc(100vh-72px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                        <p className="text-sm text-slate-500"> Memuat Repository...</p>
                    
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6">
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
                    <p className="font-semibold text-red-700"> Gagal memuat data</p>
                    <p className="mt-1 text-sm texxt-red-600"> {error} </p>
                </div>
            </main>
        )
    }

    return (
        <main>  
            <section className="Relative overflow-hidden bg-white">
                <div className="mx-auto max-w-7x1 px-6 py-20 lg:px-8 lg:py-28">
                    <div className="max-w-4xl"> 
                        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2mem] text-blue-600">Repository Otomotif</p>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">  Temukan Tugas Akhir
                            <span className="block text-blue-600">
                                Mahasiswa Otomotif
                            </span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Jelajahi Koleksi Tugas Akhir Mahasiswa berdasarkan Judul, Nama Mahasiswa, Dosen Pembimbing, Mata Kuliah dan SDGs terkait</p>
                        <div className="mt-8 max-w-2xl">
                            <div className="flex items-center rounded-xl border border-slate bg-white p-2 shadow-slate-200/50">
                                <span className="px-3 text-xl">
                                    🔍
                                </span>
                                <input type="text" placeholder="Cari Judul....." className="flex-1 bg-transparent px-2 py-3 text-sm outline-none" />
                                <Link href="/repository" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white trasition hover:bg-blue-700"> Cari </Link>
                             </div>
                        </div>
                        <div className="mt-6 flex fles-wrap gap-3">
                            <Link href="/repository" className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"> Jelajahi Repositori</Link>
                            <Link href="/sdgs" className="rounded-lg bg-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"> Lihat SDGs</Link>
                        </div>
                    </div>
                </div>
            </section>
            <section className="border-y border-slate-200 bg-slate-50">
                <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 py-8 md:grid-cols-4 lg:px-8">
                    <div className="border-slate-200 px-6 py-4 text-center md:border-r">
                        <p className="text-3xl font-bold text-slate-900">
                            {data?.statistics.totalTugasAkhir}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Tugas Akhir
                        </p>
                    </div>
                    <div className="border-slate-200 px-6 py-4 text-center md:border-r">
                        <p className="text-3xl font-bold text-slate-900">
                            {data?.statistics.totalDosen}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Dosen
                        </p>
                    </div>
                    <div className="border-slate-200 px-6 py-4 text-center md:border-r">
                        <p className="text-3xl font-bold text-slate-900">
                            {data?.statistics.totalRuangan}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Ruangan
                        </p>
                    </div>
                    <div className="px-6 py-4 text-center">
                        <p className="text-3xl font-bold text-slate-900">
                            {data?.statistics.totalSDGs}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            SDGs
                        </p>
                    </div>

                </div>
            </section>
                        
            <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                            Repository
                        </p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900">
                            Tugas Akhir Terbaru
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Koleksi tugas akhir yang baru ditambahkan.
                        </p>
                    </div>
                    <Link href="/repository" className="hidden text-sm font-semibold text-blue-600 hover:text-blue-700 md:block" >
                        Lihat semua →
                    </Link>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {data?.tugasAkhirTerbaru.map((TugasAkhir) => (
                        <article  key={TugasAkhir.id}  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg" >
                            <div className="mb-4 flex items-center justify-between">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    {TugasAkhir.tahunMasuk}
                                </span>
                                <span className="text-xs text-slate-400">
                                    #{TugasAkhir.id}
                                </span>
                            </div>
                            <h3 className="line-clamp-3 text-lg font-bold leading-7 text-slate-900 group-hover:text-blue-700">
                                {TugasAkhir.judul}
                            </h3>
                            <div className="mt-5 space-y-2 text-sm">
                                <div className="flex gap-2">
                                    <span className="w-24 text-slate-400">
                                        Mahasiswa
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {TugasAkhir.name}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="w-24 text-slate-400">
                                        NIM
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {TugasAkhir.nim}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="w-24 text-slate-400">
                                        Pembimbing
                                    </span>
                                    <span className="font-medium text-slate-700">
                                        {TugasAkhir.pembimbing.name}
                                    </span>
                                </div>
                            </div>
                            {TugasAkhir.sdgs.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-1.5">
                                    {TugasAkhir.sdgs.slice(0, 3).map((sdg) => (
                                        <span key={sdg.id} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600" >
                                            {sdg.code}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6 border-t border-slate-100 pt-4">
                                <Link href={`/tugas-akhir/${TugasAkhir.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700" >
                                    Lihat Detail →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
                {data?.tugasAkhirTerbaru.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
                        <p className="font-medium text-slate-600">
                            Belum ada tugas akhir.
                        </p>
                    </div>
                )}
            </section>
        </main>
    )
}