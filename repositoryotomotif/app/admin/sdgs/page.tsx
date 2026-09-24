"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type SDGs = {
    id: number;
    code: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

const Author_Preview_Limit = 3;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search preview-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg> 
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw preview-icon"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const CalenderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days preview-icon"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/></svg>
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user preview-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const ChevronIcon = () => ({open} : {open : boolean}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right preview-icon"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>

export default function SDGsPage() {
    const router = useRouter();
    const [sdgs, setSDGs] = useState<SDGs[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    const sortedSdgs = useMemo(() => {
        return [...sdgs].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [sdgs]);

    useEffect(() => {
        async function fetchSDGs() {
            try {
                setError("");

                const response = await fetch("/api/sdgs");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Gagal mengambil data SDGs");
                }
                setSDGs(data);
            } catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchSDGs();
    }, []);

    async function handleDelete(id: number) {
        const confirmed = window.confirm(
            "Apakah Anda yakin ingin menghapus SDGs ini?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/sdgs/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menghapus SDGs");
            }

            setSDGs((currentSDGs) => currentSDGs.filter((s) => s.id !== id));
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menghapus SDGs"
            );
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

    const filteredData =  useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return sdgs;
        return sdgs.filter((item) => {
            const image = (item.imageUrl || ""). toLowerCase();
            const deskripsi = (item.description || " ").toLowerCase() .includes(q);
            const titile = (item.title || " ").toLowerCase() .includes(q);
            return image || deskripsi || deskripsi ;
        });
    }, [sdgs, search]);



    if (loading) {
        return (
            <main className="page-shell">
                <p>Memuat data SDGs...</p>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <section className="page-heading">
                <div>
                    <p className="eyebrow">Pusat administrasi</p>
                    <h1>Data SDGs</h1>
                    <p className="page-description">
                        Kelola data Sustainable Development Goals dan gambar logo resmi yang digunakan dalam repository.
                    </p>
                </div>

                <button onClick={() => router.push("/admin/sdgs/create")} className="primary-button">
                    <span aria-hidden="true">+</span>
                    Tambah SDGs
                </button>
            </section>

            {error && (
                <div className="error-banner" role="alert">
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
                {/* <button type="button" onClick={() => setSearch("")} className="shrink-0 rounded-xl border border-[var(--border)] bg-white p-3 text-[var(--muted)] shadow-sm">
                    <FilterIcon />
                </button> */}
            </div>

            <div className="lg:hidden w-full max-w-[1200px] mx-auto mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
                <span>Total Data</span>
                <span className="count-pill">{filteredData.length} SDGs</span>
            </div>
            {/* card */}
            <section className="lg:hidden w-full max-w-[1200px] mx-auto mt-4 space-y-3">
                {filteredData.length === 0 ? (
                    <p className="empty-state rounded-2xl border border-[var(--border)] bg-white">
                        Belum ada Data SDGs
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
                                    <div className="flex-1 space-y-3">
                                        <div className="flex min-w-0 gap-3">
                                            <div className="h-14 w-14 shrink-0">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt="logo sdgs" className="h-14 w-14 rounded-xl object-cover border border-gray-100 shadow-sm" />
                                                ) : (
                                                    <div className="h-14 w-14 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 border">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <span className="flex-1 min-w-0 text-xs font-bold text-[#0F172A] leading-snug uppercase">
                                                {item.title || "-"}
                                            </span>
                                        </div>
                                        <span className=" text-justify mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                            {item.description || "-"}
                                        </span>

                                    </div>  
                                </button>

                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => router.push(`/admin/sdgs/${item.id}/edit`)} className="flex-1 rounded-lg bg-[var(--blue-soft)] py-2 text-sm font-semibold text-[var(--blue-mid)]">
                                        edit
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

            <section className="hidden lg:block content-panel">
                <div className="panel-heading">
                    <div>
                        <p className="eyebrow">Daftar SDGs</p>
                        <h2>Sustainable Development Goals</h2>
                    </div>
                    <span className="count-pill">{sdgs.length} SDGs</span>
                </div>

                {sdgs.length === 0 ? (
                    <p className="empty-state">Belum ada data SDGs.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Logo</th>
                                    <th>Kode</th>
                                    <th>Judul</th>
                                    <th>Deskripsi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="justify-start">
                                {sortedSdgs.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    className="h-10 w-10 rounded object-contain border bg-white p-0.5"
                                                />
                                            ) : (
                                                <span className="text-xs italic text-gray-400">Tidak Ada</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="id-badge">{item.code}</span>
                                        </td>
                                        <td>
                                            <strong className="user-name">{item.title}</strong>
                                        </td>
                                        <td>{item.description || "-"}</td>
                                        <td className="action-cell">
                                            <button
                                                onClick={() => router.push(`/admin/sdgs/${item.id}/edit`)}
                                                className="edit-button"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="delete-button"
                                            >
                                                Hapus
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
    );
}
