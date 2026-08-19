"use client";
import { useEffect, useState } from "react";

type User = {
    id : number;
    name : string;
    email : string;
    createdAt: string;
    updatedAt: string;
};

export default function UsersPage() {
    const[users, setUsers] = useState<User[]>([]);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState("");

    async function loadUsers() {
        try {
            const response = await fetch("/api/users");
            if (!response.ok) {
                throw new Error("Gagal mengambbil data");
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
            setError (
                error instanceof Error ? error.message : "Terjadi kesalahan"
            );
        } finally {
            setLoading(false);
        }
    }



    useEffect(() => {
        let cancelled = false;

        async function fetchUsers() {
            try {
                const response = await fetch("/api/users");

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Gagal mengambil data user"
                    );
                }

                if (!cancelled) {
                    setUsers(data);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Terjadi kesalahan"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchUsers();

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleDelete(id : number) {
        const confirmed = window.confirm (
            "Aakah anda yakin ingin menghapus user ini ?"
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

            await loadUsers();

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
        <main className="min-h-screen p-8">
            <h1 className="mb-6 text-3xl font-bold">
                Data User
            </h1>

            {error && (
                <p className="mb-6 text-3xl font-bold">
                    {error}
                </p>
            )}

            {users.length === 0 ? (<p>Belum ada User.</p>) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                        <thead>
                            <tr>
                                <th className="border p-3 text-left">ID</th>
                                <th className="border p-3 text-left">Nama</th>
                                <th className="border p-3 text-left">Email</th>
                                <th className="border p-3 text-left">Dibuat</th>
                                <th className="border p-3 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="border p-3">
                                        {user.id}
                                    </td>
                                    <td className="border p-3">
                                        {user.name}
                                    </td>
                                    <td className="border p-3">
                                        {user.email}
                                    </td>
                                    <td className= "border p-3">
                                        {new Date(user.createdAt).toLocaleDateString(
                                            "id-ID"
                                        )}
                                    </td>
                                    <td className="border p-3">
                                        <button onClick={() => window.location.href = `/users/${user.id}/edit`}
                                            className="rounded-lg border px-3 py-2 text-sm">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(user.id)}
                                            className="ml-2 rounded-lg-border border-red-300 px-3 py-2 txt-sm text-sm text-red-600 ">
                                            Delete
                                        </button>
                                    </td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </main>
    )
}