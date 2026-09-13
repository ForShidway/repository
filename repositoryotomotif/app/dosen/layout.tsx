"use client";

import { useState, useEffect } from "react";
import SidebarDosen from "@/components/dosenkj/Sidebar";

export default function DosenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Auto-collapse sidebar on tablet
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && window.innerWidth >= 768) {
                setCollapsed(true);
            }
            if (window.innerWidth < 768) {
                setMobileOpen(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const mainMargin = collapsed ? "md:ml-[72px]" : "md:ml-[272px]";

    return (
        <div className="min-h-screen bg-slate-50">
            <SidebarDosen
                collapsed={collapsed}
                onToggle={() => setCollapsed((prev) => !prev)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            {/* Mobile hamburger button */}
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-5 z-40 flex md:hidden h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-900/20"
                aria-label="Open menu"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            <main className={`min-h-screen min-w-0 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${mainMargin}`}>
                {children}
            </main>
        </div>
    );
}
