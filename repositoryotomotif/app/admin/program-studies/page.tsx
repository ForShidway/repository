"use client";

import { useEffect, useState } from "react";
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

export default function ProgramStudiesPage() {
    const router = useRouter();

    const [programStudies, setProgramStudies] =
        useState<ProgramStudy[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

            <section className="content-panel">
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