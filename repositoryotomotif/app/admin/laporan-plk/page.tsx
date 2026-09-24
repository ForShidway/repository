"use client"

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type LaporanPlk = {
    id: number;
    name: string;
    nim: string;
    judul: string;
    namaInstansi: string;
    alamat: string;
    dosenPembimbing: {id: number, name:string}
    tanggalMulai: string;

}


const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search preview-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg> 
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw preview-icon"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const CalenderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days preview-icon"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/></svg>
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user preview-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const NimIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-user preview-icon"><path d="M15 13a3 3 0 1 0-6 0"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><circle cx="12" cy="8" r="2"/></svg>
const ChevronIcon = () => ({open} : {open : boolean}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right preview-icon"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>



export default function LaporanPlkPage() {
    const router = useRouter();
    const [data, setData] = useState<LaporanPlk[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    useEffect(() => {
        async function fetchData() {
            try { 
                const response = await fetch("/api/laporanPlk");
                const result = await response.json();
                if(!response.ok) {
                    throw new Error(
                        result.message || "Gagal mengambil Data"
                    )
                }
                setData(result);
            } catch (error) {
                console.error(error);
                setError( error instanceof Error ? error.message : "Terjaddi kesalahan")
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    async function handleDelete(id: number) {
        const confirmed = window.confirm(
            "Apakah Anda yakin ingin menghapus data Laporan PLK ini?"
        );
        if(!confirmed) {
            return;
        }
        try{
            const response = await fetch(`/api/laporanPlk/${id}`,{
                method: "DELETE"
            })
            const result = await response.json();
            if (!response.ok) {
                throw new Error(
                    result.message || "Gagal Menghapus Data"
                )
            }
            setData((current) => current.filter((item) => item.id !== id))
        } catch (error) {
            console.error(error) ;
            setError( error instanceof Error? error.message : "Gagal Menghapus Data")
        }
    }

    function toogleExpanded(id: number) {
        setExpandedCards((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        })
    }
    
    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data;
        return data.filter((item) => {
            const judul = (item.judul || ""). toLowerCase();
            const name = (item.name).toLowerCase();
            const nim = (item.nim || "").toLowerCase();
            return judul.includes(q) || name.includes(q) || nim.includes(q);
        });
    }, [data, search]);

    if (loading) {
        return <p>Loading...</p>
    }

     return (
        <main className="page-shell">
            <section className="page-heading">
                <div>
                    <p className="eyebrow">
                        Repository Jurusan
                    </p>
                    <h1>
                        Kumpulan Data Laporan Pelatihan Lapangan Kependidikan
                    </h1>
                    <p className="page-description">
                        Kelola Data Laporan Pelatihan Lapangan Kependidikan
                    </p>
                </div>
                <a href="/api/admin/export?type=laporan-plk" download className="primary-button">
                    Unduh Excel
                </a>
            </section>
            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <div className="w-full max-w-[1200px] mx-auto mt-6 flex items-center gap-3" >
                <div className="flex-1 min-w-0 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm">
                    <span className="text-[var(--muted-light)]"><SearchIcon /></span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama, judul, NIM..."
                        className="flex-1 mini-w-0 bg-transparent outline-none text-sm"
                    />
                </div>
            </div>

            <div className="md:hidden w-full max-w-[1200px] mx-auto mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Total Data</span>
                <span className="count-pill">{filteredData.length} Laporan  Praktik Kependidikan</span>
            </div>

            {/* card */}
            <section className="md:hidden w-full max-w-[1200px] mx-auto mt-4 space-y-3">
                {filteredData.length === 0 ? (
                    <p className="empty-state rounded-2xl border border-[var(--border)] bg-white">
                        Belum ada Data 
                    </p>
                ) : (
                    filteredData.map((item, index) => {
                        const isExpanded = expandedCards.has(item.id);
                        return (
                            <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
                                <button type="button" onClick={() => toogleExpanded(item.id)} className="w-full flex items-start gap-3 text-left">
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--blue-soft)] text-[var(--blue-mid)] text-sm font-bold">
                                        {index+1}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-[15px] font-bold leading-snug text-[var(--navy)]">
                                            {item.judul || "-"}
                                        </span>
                                        <span className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                            <UserIcon /> {item.name || "-"}
                                        </span>
                                        <div className="flex justify-between pr-4">
                                            <span className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                                <NimIcon /> {item.nim || "-"}
                                            </span>
                                            <span className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                                <CalenderIcon /> 
                                                <span> {item.tanggalMulai ? new Date(item.tanggalMulai).getFullYear() : "-" }</span>
                                            </span>
                                        </div>
                                        
                                    </span>
                                </button>

                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => router.push(`/admin/laporan-plk/${item.id}`)} className="flex-1 rounded-lg bg-[var(--blue-soft)] py-2 text-sm font-semibold text-[var(--blue-mid)]">
                                        Lihat Detail
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="flex-1 rounded-lg bg-[#fff5f5] py-2 text-sm font-semibold text-[#dc2626]">
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>

            <section className="hidden md:block content-panel">
                <div className="panel-heading">
                    <div>
                        <p className="eyebrow">Daftar LPK</p>
                        <h2>Laporan Pelatihan Kependidikan Mahasiswa</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        
                        <span className="count-pill">{data.length} Laporan Pelatihan Kependidikan</span>
                    </div>
                </div>
                {data.length === 0 ? (
                    <p className="empty-state">Belum ada Data Laporan Pelatihan Kependidikan</p>
                ): (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Mahasiswa</th>
                                    <th>NIM</th>
                                    <th>Nama Instansi</th>
                                    <th>Alamat</th>
                                    <th>Dosen Pembimbing </th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={(item.id)}>
                                        <td>{index + 1}</td>
                                        <td><strong>{item.name || "-"}</strong></td>
                                        <td>{item.nim || "-"}</td>
                                        <td>{item.namaInstansi || "-"}</td>
                                        <td>{item.alamat || "-"}</td>
                                        <td>{item.dosenPembimbing?.name || ""}</td>
                                        <td className="action-cell">
                                            <button onClick={() => router.push(`/admin/laporan-plk/${item.id}`) }  className="detail-button"  >
                                                Lihat Detail
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="delete-button">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    )
}