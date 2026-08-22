"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Manufacturing_Consent } from "next/font/google";
import { Main } from "next/document";

type Dosen = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export default function DosensPage() {
    const router = useRouter();
    const [dosens, setDosens] = useState<Dosen[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDosens() {
            try {
                setError("");
                const response = await fetch("/api/dosens");
                const data = await response.json();
                if (!response.ok) {
                    throw new Error (
                        data.message || "Gagal mengambil data dosen"
                    )
                }
                setDosens(data);
            }catch (error) {
                console.error(error);
                setError(error instanceof Error ? error.message : "Telah Terjadi Kesalahan");
            } finally {
                setLoading(false);
            }
        }
        fetchDosens();
    }, []);

    async function handleDelete(id : number) {
        const confirmed = window.confirm (
            "Apakah anda yakin ingin menghapus data ini"
        )
        if (!confirmed) {
            return;
        }
        try {
            const response = await fetch(`/api/dosens/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal Menghapus Data Dosen"
                )
            }
            setDosens((currentDosens) => currentDosens.filter((dosen) => dosen.id !== id));
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
                    <h1>Dosen Dosen Jurusan</h1>
                </div>
                <button onClick={() => router.push("/dosens/create")} className="primary-button">
                    <span aria-hidden="true"> Tambah Dosen</span>
                </button>
            </section>
            { error && (
                <div className="error-banner" role="alert">{error}</div>
            )}

            <section className="content-panel">
                <h1>Daftar Dosen Terdaftar</h1>
                {dosens.length === 0 ? (<p className="empty-state">belum ada user terdaftar </p>) : (
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
                                    {dosens.map((dosen, index) => (
                                        <tr key={dosen.id}>
                                            <td>
                                                <span>{index + 1}</span>
                                            </td>
                                            <td>
                                                <strong>{dosen.name}</strong>
                                            </td>
                                            <td className="user-date">
                                                {new Date(dosen.createdAt).toLocaleDateString(
                                                    "id-ID"
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => router.push(`/dosens/${dosen.id}/edit`)} className="edit-button">Edit</button>
                                                <button onClick={() => handleDelete(dosen.id)} className="delete-button">Hapus</button>
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
