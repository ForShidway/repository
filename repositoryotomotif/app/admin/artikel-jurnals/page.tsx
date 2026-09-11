"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ArtikelJurnal = {
    id: number;
    judul: string;
    tahun: number | string;
    penulis?: Array<{ nama: string; nim: string | null; tipe?: string | null }>;
}

export default function ArtikelJurnalPage() {
    const router = useRouter();
    const [data, setData] = useState<ArtikelJurnal[]>([]);

    const formatPenulis = (penulis: Array<{ nama: string; nim: string | null; tipe?: string | null }> = []) => {
        if (!penulis.length) return "-";
        return penulis
            .map((item) => {
                if (item.tipe === "MAHASISWA" && item.nim) {
                    return `${item.nama} (${item.nim})`;
                }
                return item.nama;
            })
            .join("  ");
    };
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
                        Data Kumpulan Artikel Jurnal
                    </h1>
                    <p className="page-description">
                        Kelola data Artikel Jurnal Mahasiswa
                    </p>
                </div>
            </section>
            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <section className="content-panel">
                <div className="panel-heading">
                    <div>
                        <p className="eyebrow">Daftar TA</p>
                        <h2>Artikel Jurnal Mahasiswa</h2>
                    </div>
                    <span className="count-pill">{data.length} Artikel Jurnal</span>
                </div>
                {data.length === 0 ? (
                    <p className="empty-state">Belum ada Data Artikel Jurnal</p>
                ): (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Penulis</th>
                                    <th>NIM</th>
                                    <th>Judul</th>
                                    <th>Tahun Masuk</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={(item.id)}>
                                        <td>{index + 1}</td>
                                        <td><strong>{formatPenulis(item.penulis)}</strong></td>
                                        <td>{item.penulis?.filter((penulisItem) => penulisItem.tipe === "MAHASISWA").map((penulisItem) => penulisItem.nim || "-").join("  ") || "-"}</td>
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