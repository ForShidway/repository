import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { TfiWorld } from "react-icons/tfi";
import { MdOutlineMail } from "react-icons/md";

export function Footer() {
    return (
        <footer className="bg-[#0B1F3A] text-slate-200">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 shrink-0 transition group-hover:scale-105">
                                <img src="/images/logo-otomotif.png" alt="Logo Jurusan Otomotif" />
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
                                <Link href="/sdgs" className="transition hover:text-white">
                                    SDGs
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
                        <ul className="mt-4 space-y-2 text-sm text-slate-300">
                            <li>Jurusan Teknik Otomotif Fakultas Teknik Universitas Negeri Padang</li>
                            <li>Kampus UNP Air Tawar Jl. Prof. Dr. Hamka, Padang</li>
                        </ul>
                        <div className="pt-4 flex items-center gap-4">
                            <a href="https://www.facebook.com/JurusanTeknikOtomotifUnp">
                                <FaFacebook size={24} />
                            </a>
                            <a href="https://www.instagram.com/otomotif_ftunp/">
                                <FaInstagram size={24} />
                            </a>
                            <a href="https://otomotif.ft.unp.ac.id/">
                                <TfiWorld size={24}/>
                            </a>
                            <a href="https://mailto:otomotif@ft.unp.ac.id">
                                <MdOutlineMail size={24}/>
                            </a>
                        </div>


                    </div>
                </div>

                <div className="mt-10 border-t border-slate-700 pt-6 text-sm text-slate-400 text-center">
                    © {new Date().getFullYear()} Repository Jurusan Teknik Otomotif Fakultas Teknik Universitas Negeri Padang
                </div>
            </div>
        </footer>
    );
}
