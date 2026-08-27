import { Navbar } from "@/components/navbar";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <Navbar />
            <main className="min-h-screen bg-slate-50">  
                {children}
            </main>
        </div>
    )
}