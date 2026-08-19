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
        loadUsers();
    }, []);
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