"use client";

import { useEffect, useState} from "react";
import { useRouter } from "next/navigation";

type TugasAkhir = {
    id : number,
    name: string,
    tahunMasuk: number,
    nim : string,
    judul: string,
    mataKuliahRelevan:string,
    ruangan: {id: number, name:string}
    pembimbing: {id: number, name: string}
    dosenPa: {id: number, name:string}
};

export default function TugasAkhirPage() {
    const router = useRouter();
    const [data, setData] = useState<TugasAkhir[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/tugas-akhirs");
                const result = await response.json();
                if(!response.ok) {
                    throw new Error(
                        result.message || "Gagal mengambil data"
                    )
                }
                setData(result);
            } catch  (error){
                console.error(error);
                setError( error instanceof Error ? error.message : "Terjadi Kesalahan")
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    async function handleDelete(id: number) {
        const confirmed = window.confirm(
            "Apakah anda yakin ingin menghapus data tugas akhir ini?"
        );
        if(!confirmed) {
            return;
        }
        try {
            const response = await fetch(`/api/tugas-akhirs/${id}`,{
                method: "DELETE"
            })
            const result = await response.json();
            if(!response.ok) {
                throw new Error(
                    result.message || "Gagal Menghapus Data"
                )
            }
            setData((current) => current.filter((item) => item.id !== id))
        } catch (error) {
            console.error(error);
            setError(
                error instanceof Error ? error.message : "Gagal Menghapus Data"
            );
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
                        Data Kumpulan Tugas Akhir
                    </h1>
                    <p className="page-description">
                        Kelola data tugas Akhir mahasiswa
                    </p>
                </div>
                <button onClick={() => router.push("/tugas-akhirs/create")} className="primay-button">
                    <span>Tambahkan Tugas Akhir</span>
                </button>
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
                        <h2>Tugas Akhir Mahasiswa</h2>
                    </div>
                    <span className="count-pill">{data.length} TA</span>
                </div>
                {data.length === 0 ? (
                    <p className="empty-state">Belum ada Data TA</p>
                ): (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Mahasiswa</th>
                                    <th>NIM</th>
                                    <th>Judul</th>
                                    <th>Tahun Masuk</th>
                                    <th>Ruangan</th>
                                    <th>Pembimbing</th>
                                    <th>Dosen PA</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={(item.id)}>
                                        <td>{index + 1}</td>
                                        <td> <strong>{item.name}</strong> </td>
                                        <td>{item.nim}</td>
                                        <td>{item.judul}</td>
                                        <td> {item.tahunMasuk} </td>
                                        <td> {item.ruangan.name} </td>
                                        <td> {item.pembimbing.name} </td>
                                        <td> {item.dosenPa.name} </td>
                                        <td className="action-cell">
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