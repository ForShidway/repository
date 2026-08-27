"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = { 
    label : string;
    href : string;
    icon : string;
};

const menuGroups = [
    {
        title: "MAIN",
        items : [
            {
                label:"Dahboard",
                href: "/dashoard",
                icon: ""
            }
        ]
    }, {
        title: "DATA AKADEMIK",
        items: [
            {
                label: "Pengguna",
                href: "/admin/users",
                icon: ""
            },
            {
                label: "Dosen",
                href:"/admin/dosens"
            },
            {
                label:"Ruangan Ujian ",
                href: "ruangans"
            },
        ]
    }, {
        title: "Repository",
        items: [
            {
                label:"Tugas Akhir",
                href:"/admin/tugas-akhirs"
            }, {
                label: "SDGS",
                href: "/admin/sdgs"
            }
        ]
    }, 
];


export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

            {/* Logo */}
            <div className="flex h-20 items-center border-b border-slate-100 px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
                    
                </div>
                <div className="ml-3">
                    <h1 className="text-sm font-bold tracking-tight text-slate-900">
                        Repository Otomotif
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Admin Panel
                    </p>
                </div>
            </div>
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-5">
                {menuGroups.map((group) => (
                    <div key={group.title} className="mb-6">
                        <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.15em] text-slate-400">
                            {group.title}
                        </p>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            group flex items-center rounded-xl px-3 py-2.5
                                            text-sm font-medium transition-all duration-200
                                            ${
                                                active
                                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }
                                        `}
                                    >

                                        <span
                                            className={`
                                                flex h-9 w-9 items-center justify-center
                                                rounded-lg text-base transition
                                                ${
                                                    active
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                                }
                                            `}
                                        >
                                            {item.icon}
                                        </span>

                                        <span className="ml-3 flex-1">
                                            {item.label}
                                        </span>

                                        {active && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                        )}

                                    </Link>
                                );
                            })}

                        </div>

                    </div>

                ))}

            </nav>

            {/* Admin Profile */}
            <div className="border-t border-slate-100 p-4">
                <div className="flex items-center rounded-xl bg-slate-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        A
                    </div>
                    <div className="ml-3 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                            Administrator
                        </p>

                        <p className="truncate text-xs text-slate-500">
                            Repository Otomotif
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="mt-3 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                    <span className="mr-3">↪</span>
                    Keluar
                </button>

            </div>

        </aside>
    );
}