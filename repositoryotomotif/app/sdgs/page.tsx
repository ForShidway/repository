"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SDGs={
    id: number,
    code : string,
    title: string,
    description: string | null,
    isActive : boolean,
    createdAt: string,
    updatedAt: string,
}

export default function SDGsPage() {
    const router = useRouter();

    const [sdgs, setSDGs] = useState<SDGs[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchSDGs() {
            try {
                setError("");

                const response = await fetch("/api/sdgs");
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Gagal mengambil data SDGs"
                    );
                }
                setSDGs(data);
            } catch (error) {
                console.error(error);
                setError(
                    error instanceof Error ? error.message  : "Terjadi kesalahan"
                );
            } finally { setLoading(false); }
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
                throw new Error(
                    data.message || "Gagal menghapus SDGs"
                );
            }

            setSDGs((currentSDGs) =>
                currentSDGs.filter((sdgs) => sdgs.id !== id)
            );

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
        return <p>Loading...</p>;
    }

    return (
        <main className="page-shell">

            <section className="page-heading">
                <div>
                    <p className="eyebrow">Pusat administrasi</p>
                    <h1>Data SDGs</h1>
                    <p className="page-description">
                        Kelola data Sustainable Development Goals
                        yang digunakan dalam repository.
                    </p>
                </div>

                <button  onClick={() => router.push("/sdgs/create")} className="primary-button" >
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
                        <p className="eyebrow">  Daftar SDGs </p>
                        <h2>  Sustainable Development Goals </h2>
                    </div>
                    <span className="count-pill">
                        {sdgs.length} SDGs
                    </span>
                </div>

                {sdgs.length === 0 ? (  
                    <p className="empty-state">
                        Belum ada data SDGs.
                    </p>
                ) : (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Kode</th>
                                    <th>Judul</th>
                                    <th>Deskripsi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>

                            <tbody>
                                {sdgs.map((sdgs, index) => (
                                    <tr key={sdgs.id}>
                                        <td>
                                            {index + 1}
                                        </td>
                                        <td>
                                            <span className="id-badge">
                                                {sdgs.code}
                                            </span>
                                        </td>
                                        <td>
                                            <strong className="user-name">
                                                {sdgs.title}
                                            </strong>
                                        </td>
                                        <td>
                                            {sdgs.description || "-"}
                                        </td>
                                        <td className="action-cell">
                                            <button onClick={() => router.push(  `/sdgs/${sdgs.id}/edit` ) } className="edit-button"  >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(sdgs.id) } className="delete-button" >
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
