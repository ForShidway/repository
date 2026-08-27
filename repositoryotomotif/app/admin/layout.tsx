import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-layout min-h-screen bg-gray-50">

            <Sidebar />

            <main className="ml-72 min-h-screen min-w-0">
                {children}
            </main>

        </div>
    );
}