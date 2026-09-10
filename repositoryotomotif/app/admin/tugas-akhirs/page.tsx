"use client";

import { useEffect, useState} from "react";
import { useRouter } from "next/navigation";

type Mahasiswa = {
    id: number;
    name: string;
    nim: string;
    urutan: number;
};

type TugasAkhir = {
    id : number,
    tahunMasuk: number,
    judul: string,
    jenisPendidikan: "PENDIDIKAN" | "NON_PENDIDIKAN",
    mataKuliahRelevan:string,
    ruangan: {id: number, name:string}
    pembimbing: {id: number, name: string}
    dosenPa: {id: number, name:string}
    mahasiswa: Mahasiswa[];
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
                                    <th>Kategori</th>
                                    <th>Tahun Masuk</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={(item.id)}>
                                        <td>{index + 1}</td>
                                        <td> <strong> {item.mahasiswa?.map((m) => m.name).join(", ") || "-"} </strong> </td>
                                        <td>{item.mahasiswa?.map((m) => m.nim).join(", ") || "-"}</td>
                                        <td>{item.judul}</td>
                                        <td>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.jenisPendidikan === "NON_PENDIDIKAN" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                {item.jenisPendidikan === "NON_PENDIDIKAN" ? "Non Pendidikan" : "Pendidikan"}
                                            </span>
                                        </td>
                                        <td> {item.tahunMasuk} </td>
                                        <td className="action-cell">
                                            <button onClick={() => router.push(`/admin/tugas-akhirs/${item.id}`) }  className="detail-button"  >
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