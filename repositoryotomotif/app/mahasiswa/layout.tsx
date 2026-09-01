import NavbarMahasiswa from "@/components/mahasiswa/navbar";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <NavbarMahasiswa />
            <main className="min-h-screen bg-slate-50">  
                {children}
            </main>
        </div>
    )
}