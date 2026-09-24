"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type User = {
    id : number;
    name : string;
    email : string;
    createdAt: string;
    updatedAt: string;
};

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search preview-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg> 
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw preview-icon"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const CalenderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days preview-icon"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/></svg>
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user preview-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail preview-icon"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
const ChevronIcon = () => ({open} : {open : boolean}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right preview-icon"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>


export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    useEffect(() => {
        async function fetchUsers() {
            try {
                setError("");
                const response = await fetch("/api/users");
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(
                        data.message || "Gagal mengambil data user"
                    );
                }

                setUsers(data);
            } catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Terjadi kesalahan");
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    async function handleDelete(id : number) {
        const confirmed = window.confirm (
            "Apakah anda yakin ingin menghapus user ini ?"
        );

        if(!confirmed) {
            return;
        }
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal menghapus User"
                );
            }

            setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));

        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error ? error.message : "Terjadi Kesalahan saat menghapus user"
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
        if (!q) return users;
        return users.filter((item) => {
            const nama = (item.name || ""). toLowerCase();
            const email = (item.email).toLowerCase();
            const tanggaldibuat = (item.createdAt || "").toLowerCase();
            return nama.includes(q) || email.includes(q) || tanggaldibuat.includes(q);
        });
    }, [users, search]);



    if (loading) {
        return <p> Loading... </p>;
    }

    return (
        <main className="page-shell">
            <section className="page-heading">
                <div>
                    <p className="eyebrow">Pusat administrasi</p>
                    <h1>Data Pengguna</h1>
                    <p className="page-description">Kelola Data mahasiswa, dosen, dan administrator repository secara teratur.</p>
                </div>
                <button onClick={() => router.push("/admin/users/create")} className="primary-button">
                    <span aria-hidden="true">+</span> Tambah User
                </button>
            </section>

            {/* <section className="stats-grid" aria-label="Ringkasan pengguna">
                <div className="stat-card"><span className="stat-icon blue">U</span><div><p>Total User</p><strong>{users.length}</strong></div></div>
                <div className="stat-card"><span className="stat-icon gold">A</span><div><p>Status Sistem</p><strong className="status-text">Aktif</strong></div></div>
                <div className="stat-card"><span className="stat-icon green">R</span><div><p>Akses Repository</p><strong className="status-text">Terhubung</strong></div></div>
            </section> */}

            {error && (
                <div className="error-banner" role="alert">{error}</div>
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
                <span className="count-pill">{filteredData.length} User</span>
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
                                            {item.name || "-"}
                                        </span>
                                        <span className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                            <EmailIcon /> {item.email || "-"}
                                        </span>
                                        <span className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                            <CalenderIcon /> 
                                            <span> {item.createdAt || "-" }</span>
                                        </span>
                                                        
                                    </span>
                                </button>

                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => router.push(`/admin/users/${item.id}/edit`)} className="flex-1 rounded-lg bg-[var(--blue-soft)] py-2 text-sm font-semibold text-[var(--blue-mid)]">
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
                    <div><p className="eyebrow">Daftar akun</p><h2>Pengguna terdaftar</h2></div>
                    <span className="count-pill">{users.length} akun</span>
                </div>
                {users.length === 0 ? (<p className="empty-state">Belum ada user yang terdaftar.</p>) : (
                <div className="table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Nama</th><th>Email</th><th>Dibuat</th><th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id}>
                                    <td><span className="id-badge">#{index + 1}</span></td>
                                    <td><strong className="user-name">{user.name}</strong></td>
                                    <td className="user-email">{user.email}</td>
                                    <td className="user-date">
                                        {new Date(user.createdAt).toLocaleDateString(
                                            "id-ID"
                                        )}
                                    </td>
                                    <td className="action-cell">
                                        <button onClick={() => router.push(`/admin/users/${user.id}/edit`)} className="edit-button">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="delete-button">Hapus</button>
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