"use client"

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    GraduationCap,
    Users,
    Building2,
    Globe2,
    BookOpen,
    Briefcase,
    Sparkles,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from "lucide-react";

type ArtikelJurnal = {
    id: number;
    judul: string;
    tahun: number | string;
    penulis ?: Array<{ nama: string; nim: string | null; tipe?: string | null }>;
}

const Author_Preview_Limit = 3;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search preview-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg> 
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw preview-icon"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const CalenderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days preview-icon"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/></svg>
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user preview-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const ChevronIcon = () => ({open} : {open : boolean}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right preview-icon"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>



export default function ArtikelJurnalPage() {
    const router = useRouter();
    const [data, setData] = useState<ArtikelJurnal[]>([]);
    const [search, setSearch] = useState("");
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    const [showAllAuthors, setShowAllAuthors] = useState<Set<number>>(new Set());

    


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/artikel-jurnal");
                const contentType = response.headers.get("content-type") || "";

                if (!contentType.includes("application/json")) {
                    const text = await response.text();
                    throw new Error(
                        text.includes("<!DOCTYPE")
                            ? "Endpoint artikel jurnal tidak ditemukan atau server mengembalikan halaman HTML."
                            : text || "Gagal mengambil Data"
                    );
                }

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Gagal mengambil Data");
                }
                setData(result);
            } catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Terjaddi kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    async function handleDelete(id: number) {
        const confirmed = window.confirm(
            "Apakah Anda yakin ingin menghapus data Artikel Jurnal ini?"
        );
        if(!confirmed) {
            return;
        }
        try{
            const response = await fetch(`/api/artikel-jurnal/${id}`,{
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

    function toogleExpanded(id:  number) {
        setExpandedCards((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id); 
            else next.add(id);
            return next;
        })
    }
    function toogleShowAllAuthors(id: number) {
        setShowAllAuthors((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        })
    }
    const filteredData =  useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data;
        return data.filter((item) => {
            const judul = (item.judul || ""). toLowerCase();
            const penulis = (item.penulis || "").toString();
            const nims = (item.penulis || []) .map((p) => (p.nim || ""). toLowerCase()). join (" ");
            return judul.includes(q) || penulis.includes(q) || nims.includes(q);
        });
    }, [data, search]);

    if (loading) {
        return <p>Loading...</p>
    }

     return (
        <main className="page-shell">
            <section className="page-heading justify-between">
                <div>
                    <p className="eyebrow">
                        Repository Jurusan
                    </p>
                    <h1>
                        Data Kumpulan Artikel Jurnal
                    </h1>
                    <p className="page-description">
                        Kelola data Artikel Jurnal Mahasiswa
                    </p>
                </div>
                <a href="/api/admin/export?type=artikel-jurnal" download className="primary-button">
                    Unduh Excel
                </a>
            </section>
            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            {/* untuk tampilan mobile */}
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
                {/* <button type="button" onClick={() => setSearch("")} className="shrink-0 rounded-xl border border-[var(--border)] bg-white p-3 text-[var(--muted)] shadow-sm">
                    <FilterIcon />
                </button> */}
            </div>

            <div className="md:hidden w-full max-w-[1200px] mx-auto mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Total Data</span>
                <span className="count-pill">{filteredData.length} Artikel Jurnal</span>
            </div>
            {/* card */}
            <section className="md:hidden w-full max-w-[1200px] mx-auto mt-4 space-y-3">
                {filteredData.length === 0 ? (
                    <p className="empty-state rounded-2xl border border-[var(--border)] bg-white">
                        Belum ada Data Artikel Jurnal
                    </p>
                ) : (
                    filteredData.map((item, index) => {
                        const authors = item.penulis || [];
                        const isExpanded = expandedCards.has(item.id);
                        const showAll = showAllAuthors.has(item.id);
                        const visibleAuthors = showAll ? authors : authors.slice(0, Author_Preview_Limit);

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
                                            <CalenderIcon /> {item.tahun || "-"}
                                        </span>
                                    </span>
                                </button>

                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => router.push(`/admin/artikel-jurnals/${item.id}`)} className="flex-1 rounded-lg bg-[var(--blue-soft)] py-2 text-sm font-semibold text-[var(--blue-mid)]">
                                        Lihat Detail
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="flex-1 rounded-lg bg-[#fff5f5] py-2 text-sm font-semibold text-[#dc2626]">
                                        Hapus
                                    </button>
                                </div>

                                {isExpanded && authors.length > 0 && (
                                    <div className="mt-3 border-t border-[var(--border)] pt-3">
                                        <p className="text-sm font-semibold text-[var(--blue-mid)]">Semua Penulis ({authors.length})</p>
                                        <ol className="mt-2 space-y-1.5">
                                            {visibleAuthors.map((p, i) => (
                                                <li key={i} className="text-sm">{i+1}. {p.nama}{p.tipe === "MAHASISWA" && p.nim ? ` (${p.nim})` : ""}</li>
                                            ))}
                                        </ol>
                                        {authors.length > Author_Preview_Limit && (
                                            <button type="button" onClick={() => toogleShowAllAuthors(item.id)} className="mt-2 text-sm font-semibold text-[var(--blue-mid)]">
                                                {showAll ? "Sembunyikan" : `Lihat lebih banyak (${authors.length})`}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </section>

            <section className="hidden md:block  content-panel">
                <div className="panel-heading">
                    <div>

                        <h2> Daftar Artikel Jurnal Mahasiswa</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        
                        <span className="count-pill">{filteredData.length} Artikel Jurnal</span>
                    </div>
                </div>
                {filteredData.length === 0 ? (
                    <p className="empty-state">Belum ada Data Artikel Jurnal</p>
                ): (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Penulis</th>
                                    
                                    <th>Judul</th>
                                    <th>Tahun Wisuda</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => (
                                    <tr key={(item.id)}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {item.penulis && item.penulis.length > 0 ? (
                                                <ol className="space-y-1">
                                                    {item.penulis.map((p,i) => (
                                                        <li key={i} className="text-sm font-semibold text-sm font-semibold flex items-start gap-1.5">
                                                            <span className="shrink-0">{i + 1}.</span>
                                                            <span>
                                                                {p.nama}
                                                                {p.tipe === "MAHASISWA" && p.nim ? `(${p.nim})` : ""}
                                                            </span>
                                                            
                                                        </li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                <span className="">-</span>
                                            )}
                                        </td>
                                        <td>{item.judul || "-"}</td>
                                        <td>{item.tahun || "-"}</td>
                                        <td className="action-cell">
                                            <button onClick={() => router.push(`/admin/artikel-jurnals/${item.id}`) }  className="detail-button"  >
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