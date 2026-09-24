"use client";

import { useEffect, useState,  useMemo } from "react";
import { useRouter } from "next/navigation";

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search preview-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg> 
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw preview-icon"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const CalenderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days preview-icon"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/></svg>
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user preview-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const NimIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-user preview-icon"><path d="M15 13a3 3 0 1 0-6 0"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><circle cx="12" cy="8" r="2"/></svg>
const ChevronIcon = () => ({open} : {open : boolean}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right preview-icon"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>


export default function ProgramStudiesPage() {
    const router = useRouter();

    const [programStudies, setProgramStudies] =
        useState<ProgramStudy[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    useEffect(() => {
        async function fetchProgramStudies() {
            try {
                setError("");

                const response = await fetch(
                    "/api/program-studies"
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Gagal mengambil data Program Studi"
                    );
                }

                setProgramStudies(data);
            } catch (error) {
                console.error(error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Terjadi kesalahan"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchProgramStudies();
    }, []);

    async function handleDelete(id: number) {
        const confirmed = window.confirm(
            "Apakah Anda yakin ingin menghapus Program Studi ini?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `/api/program-studies/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Gagal menghapus Program Studi"
                );
            }

            setProgramStudies((current) =>
                current.filter(
                    (programStudy) =>
                        programStudy.id !== id
                )
            );
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat menghapus Program Studi"
            );
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
            if (!q) return programStudies;
            return programStudies.filter((item) => {
                const judul = (item.degree || ""). toLowerCase();
                const name = (item.name).toLowerCase();
                const nim = (item.description || "").toLowerCase();
                return judul.includes(q) || name.includes(q) || nim.includes(q);
            });
        }, [programStudies, search]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <main className="page-shell">
            <section className="page-heading">
                <div>
                
                    <h1>Program Studi</h1>
                    
                </div>

                <button
                    onClick={() =>
                        router.push(
                            "/admin/program-studies/create"
                        )
                    }
                    className="primary-button"
                >
                    <span aria-hidden="true">+</span>{" "}
                    Tambah Program Studi
                </button>
            </section>

            {error && (
                <div
                    className="error-banner"
                    role="alert"
                >
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
                <span className="count-pill">{filteredData.length} Program Studi</span>
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
                                            {item.degree  || "-"} {item.name || "-"}
                                        </span>
                                        {/* <span className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                            {item.description || "-"}
                                        </span> */}
                                        <span className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                            <CalenderIcon /> 
                                            <span> {item.createdAt || "-" }</span>
                                        </span>
                                    </span>
                                </button>

                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => router.push(`/admin/program-studies/${item.id}/edit`)} className="flex-1 rounded-lg bg-[var(--blue-soft)] py-2 text-sm font-semibold text-[var(--blue-mid)]">
                                        Edit
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
                        <p className="eyebrow">
                            Daftar Program Studi
                        </p>

                        <h2>
                            Program Studi Terdaftar
                        </h2>
                    </div>

                    <span className="count-pill">
                        {programStudies.length} Prodi
                    </span>
                </div>

                {programStudies.length === 0 ? (
                    <p className="empty-state">
                        Belum ada Program Studi yang
                        terdaftar.
                    </p>
                ) : (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>
                                        Program Studi
                                    </th>
                                    <th>Jenjang</th>
                                    <th>Status</th>
                                    <th>Dibuat</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {programStudies.map( (programStudy, index) => (
                                        <tr
                                            key={ programStudy.id } >
                                            <td>
                                                <span className="id-badge"> { index + 1 }
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="user-name"> { programStudy.name } </strong>
                                            </td>

                                            <td>
                                                <span className="id-badge"> {programStudy.degree} </span>
                                            </td>

                                            <td>
                                                {programStudy.isActive ? "Aktif"  : "Tidak Aktif"}
                                            </td>

                                            <td className="user-date">
                                                {new Date(
                                                    programStudy.createdAt
                                                ).toLocaleDateString(
                                                    "id-ID"
                                                )}
                                            </td>

                                            <td className="action-cell">
                                                <button
                                                    onClick={() =>
                                                        router.push( `/admin/program-studies/${programStudy.id}/edit`)
                                                    } className="edit-button" >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete( programStudy.id ) } className="delete-button" >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
}