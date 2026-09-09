import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-gradient-to-b from-[#0B1F3A] to-[#060f1e] text-slate-300">
            <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

                    {/* Brand column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-900/30">
                                RO
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400">
                                    Repository
                                </p>
                                <p className="text-lg font-bold text-white leading-tight">
                                    Otomotif UNP
                                </p>
                            </div>
                        </div>

                        <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                            Repository Tugas Akhir Jurusan Teknik Otomotif — wadah dokumentasi,
                            eksplorasi, dan pengembangan ilmu otomotif di lingkungan
                            Universitas Negeri Padang.
                        </p>

                        {/* Divider */}
                        <div className="mt-6 h-px w-16 bg-gradient-to-r from-blue-500 to-transparent" />
                    </div>

                    {/* Navigasi */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                            Navigasi
                        </h3>
                        <ul className="mt-5 space-y-3 text-sm">
                            {[
                                { label: "Beranda", href: "/" },
                                { label: "Jelajahi Repository", href: "/jelajahirepository" },
                                { label: "Dosen", href: "/dosen" },
                                { label: "Masuk", href: "/login" },
                            ].map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-slate-400 transition-colors hover:text-white"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kontak */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                            Kontak
                        </h3>
                        <ul className="mt-5 space-y-3 text-sm text-slate-400">
                            <li className="flex items-start gap-2">
                                <svg className="mt-0.5 shrink-0 text-blue-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 21h18M9 21V7l7-4v18M3 10.5l6-3.5" />
                                </svg>
                                Jurusan Teknik Otomotif
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="mt-0.5 shrink-0 text-blue-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                </svg>
                                Universitas Negeri Padang
                            </li>
                            <li className="flex items-start gap-2">
                                <svg className="mt-0.5 shrink-0 text-blue-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                repository.otomotif@unp.ac.id
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
                    <p className="text-xs text-slate-500">
                        © 2026 Repository Otomotif — Universitas Negeri Padang. Semua hak dilindungi.
                    </p>
                    <p className="text-xs text-slate-600">
                        Teknik Otomotif · UNP
                    </p>
                </div>
            </div>
        </footer>
    );
}
