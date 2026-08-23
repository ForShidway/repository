"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Manufacturing_Consent } from "next/font/google";
import { Main } from "next/document";

type Ruangan = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export default function RuangansPage() {
    const router = useRouter();
    const [ruangans, setRuangans] = useState<Ruangan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchRuangans() {
            try {
                setError("");
                const response = await fetch("/api/ruangans");
                const data = await response.json();
                if (!response.ok) {
                    throw new Error (
                        data.message || "Gagal mengambil data ruangan"
                    )
                }
                setRuangans(data);
            }catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Telah Terjadi Kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchRuangans();
    }, []);

    async function handleDelete(id : number) {
        const confirmed = window.confirm (
            "Apakah anda yakin ingin menghapus data ini"
        )
        if (!confirmed) {
            return;
        }
        try {
            const response = await fetch(`/api/ruangans/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal Menghapus Data Ruangan"
                )
            }
            setRuangans((currentRuangans) => currentRuangans.filter((ruangan) => ruangan.id !== id));
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error ? error.message : "Terjadi Kesalahan saat menghapus Data ini"
            )
        }
    }


    //page 
    if (loading) {
        return <p> Loading....</p>
    }

    return (
        <main className="page-shell">
            <section className="page-heading">
                <div>  
                    <h1>Ruangan</h1>
                </div>
                <button onClick={() => router.push("/ruangans/create")} className="primary-button">
                    <span aria-hidden="true"> Tambah Ruangan</span>
                </button>
            </section>
            { error && (
                <div className="error-banner" role="alert">{error}</div>
            )}

            <section className="content-panel">
                <h1>Daftar Ruangan</h1>
                {ruangans.length === 0 ? (<p className="empty-state">belum ada ruangan terdaftar </p>) : (
                        <div className="table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Nama</th>
                                        <th>Dibuat</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ruangans.map((ruangan, index) => (
                                        <tr key={ruangan.id}>
                                            <td>
                                                <span>{index + 1}</span>
                                            </td>
                                            <td>
                                                <strong>{ruangan.name}</strong>
                                            </td>
                                            <td className="user-date">
                                                {new Date(ruangan.createdAt).toLocaleDateString(
                                                    "id-ID"
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => router.push(`/ruangans/${ruangan.id}/edit`)} className="edit-button">Edit</button>
                                                <button onClick={() => handleDelete(ruangan.id)} className="delete-button">Hapus</button>
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
