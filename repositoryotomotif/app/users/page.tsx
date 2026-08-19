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

            {users.length === 0 ? (<p>Belum ada User.</p>) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                        <thead>
                            <tr>
                                <th className="border p-3 text-left">ID</th>
                                <th className="border p-3 text-left">Nama</th>
                                <th className="border p-3 text-left">Email</th>
                                <th className="border p-3 text-left">Dibuat</th>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </main>
    )
}


// //
// "use client";

// import { useEffect, useState } from "react";

// type User = {
//   id: number;
//   name: string;
//   email: string;
//   createdAt: string;
//   updatedAt: string;
// };

// export default function UsersPage() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   async function loadUsers() {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await fetch("/api/users");

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Gagal mengambil data user"
//         );
//       }

//       setUsers(data);
//     } catch (error) {
//       console.error(error);

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Terjadi kesalahan"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   return (
//     <main className="min-h-screen bg-gray-50 p-8">
//       <div className="mx-auto max-w-5xl">

//         {/* HEADER */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Data User
//           </h1>

//           <p className="mt-2 text-gray-600">
//             Daftar pengguna Repository Otomotif
//           </p>
//         </div>

//         {/* LOADING */}
//         {loading && (
//           <div className="rounded-lg border bg-white p-6">
//             <p className="text-gray-600">
//               Memuat data...
//             </p>
//           </div>
//         )}

//         {/* ERROR */}
//         {!loading && error && (
//           <div className="rounded-lg border border-red-200 bg-red-50 p-6">
//             <h2 className="font-semibold text-red-700">
//               Terjadi kesalahan
//             </h2>

//             <p className="mt-2 text-sm text-red-600">
//               {error}
//             </p>

//             <button
//               onClick={loadUsers}
//               className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
//             >
//               Coba Lagi
//             </button>
//           </div>
//         )}

//         {/* DATA */}
//         {!loading && !error && (
//           <div className="overflow-hidden rounded-lg border bg-white">

//             <table className="w-full">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-sm font-semibold">
//                     ID
//                   </th>

//                   <th className="px-6 py-4 text-left text-sm font-semibold">
//                     Nama
//                   </th>

//                   <th className="px-6 py-4 text-left text-sm font-semibold">
//                     Email
//                   </th>

//                   <th className="px-6 py-4 text-left text-sm font-semibold">
//                     Dibuat
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {users.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       className="px-6 py-10 text-center text-gray-500"
//                     >
//                       Belum ada data user.
//                     </td>
//                   </tr>
//                 ) : (
//                   users.map((user) => (
//                     <tr
//                       key={user.id}
//                       className="border-t"
//                     >
//                       <td className="px-6 py-4">
//                         {user.id}
//                       </td>

//                       <td className="px-6 py-4 font-medium">
//                         {user.name}
//                       </td>

//                       <td className="px-6 py-4">
//                         {user.email}
//                       </td>

//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         {new Date(
//                           user.createdAt
//                         ).toLocaleDateString("id-ID")}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//           </div>
//         )}

//       </div>
//     </main>
//   );
// }