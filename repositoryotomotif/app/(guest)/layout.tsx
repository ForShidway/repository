import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/guest/footer";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="min-h-screen bg-slate-50">
                {children}
            </main>
            <Footer />
        </div>
    );
}