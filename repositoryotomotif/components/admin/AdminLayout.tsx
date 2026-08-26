import Sidebar from "./Sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Sidebar />
            <main className="min-h-screen bg-slate-50">
                {children}
            </main>
        </div>
    )
}

    