import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-[#0B1F3A] text-slate-200">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-900/30">
                                RO
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                                    Repository
                                </p>
                                <p className="text-lg font-bold text-white">
                                    Otomotif
                                </p>
                            </div>
                        </div>

                        <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
                            Repository Tugas Akhir jurusan Teknik Otomotif yang menjadi wadah
                            dokumentasi, eksplorasi, dan pengembangan ilmu otomotif di
                            lingkungan Universitas Negeri Padang.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                            Navigasi
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-300">
                            <li>
                                <Link href="/" className="transition hover:text-white">
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href="/jelajahirepository" className="transition hover:text-white">
                                    Jelajahi Repository
                                </Link>
                            </li>
                            <li>
                                <Link href="/dosen" className="transition hover:text-white">
                                    Dosen
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="transition hover:text-white">
                                    Masuk
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                            Kontak
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-300">
                            <li>Jurusan Teknik Otomotif</li>
                            <li>Universitas Negeri Padang</li>
                            <li>repository.otomotif@unp.ac.id</li>
                            <li>+62 812-3456-7890</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t border-slate-700 pt-6 text-sm text-slate-400">
                    © 2026 Repository Otomotif. Semua hak dilindungi.
                </div>
            </div>
        </footer>
    );
}
