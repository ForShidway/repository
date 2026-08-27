"use client";

import { link } from "fs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        label: "Beranda",
        href: "/"
    },{
        label: "Repository",
        href : "/repositoy"
    },
    {
        label: "Tugas",
        href: "/"
    },
    {
        label: "Dosen",
        href: "/dosen"
    },
    {
        label: "SDGs",
        href:"/sdgs"
    }
]
export default function Navbar() {
    const pathName = usePathname();
    return (
        <header>
            <div className="sticky top-0 z-50 border -b border-slate-200 bg-white/95 backdrop-blur">
                <h1>Repository Otomotif</h1>
            </div>
            
            <nav className="hidden items-center gap-1 md:flex">
                {menuItems.map((item) => {
                    const active = item.href === "/" ? pathName === "/" : pathName.startsWith(item.href);
                    return (
                        
                        <Link key={item.href} href={item.href} className={`rounded-lg px-4 py-2 text-sm font-medium transition
                            ${ active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                            `}
                        >
                            {item.label}
                        </Link>

                    )
                })}
            </nav>

        </header>
    )

}





















