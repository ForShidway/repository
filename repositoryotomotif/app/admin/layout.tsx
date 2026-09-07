import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="admin-layout min-h-screen bg-slate-100">

            <Sidebar />

            <main className="ml-72 min-h-screen min-w-0 p-4">
                <div className="min-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl bg-[#F4F9F9] shadow-sm">
                    {children}
                </div>
            </main>

        </div>
    );
}