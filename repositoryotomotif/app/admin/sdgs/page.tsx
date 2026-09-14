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

export default function SDGsPage() {
    const router = useRouter();

    const [sdgs, setSDGs] = useState<SDGs[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

            <section className="content-panel">
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

                            <tbody>
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
