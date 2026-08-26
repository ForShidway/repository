"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

type User = {
    id : number;
    name : string;
    email : string;
    createdAt: string;
    updatedAt: string;
};

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

            <section className="content-panel">
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