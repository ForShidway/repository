import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const artikelJurnalId = Number(id);

        if (Number.isNaN(artikelJurnalId)) {
            return NextResponse.json(
                { message: "ID artikel jurnal tidak valid" },
                { status: 400 }
            );
        }

        const artikelJurnal = await prisma.artikelJurnal.findUnique({
            where: { id: artikelJurnalId },
            include: {
                programStudy: true,
                keywords: { orderBy: { id: "asc" } },
                sdgs: true,
                penulis: { 
                    orderBy: { urutan: "asc" },
                    include: { 
                        dosen: { select: { id:true, name: true}}
                    }
                }
            },
        });

        if (!artikelJurnal) {
            return NextResponse.json(
                { message: "Artikel jurnal tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(artikelJurnal);
    } catch (error) {
        console.error("GET Artikel Jurnal Detail Error:", error);
        return NextResponse.json(
            { message: "Gagal mengambil detail artikel jurnal" },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat menghapus artikel jurnal." },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const artikelJurnalId = Number(id);

        if (Number.isNaN(artikelJurnalId)) {
            return NextResponse.json(
                { message: "ID artikel jurnal tidak valid" },
                { status: 400 }
            );
        }

        const existing = await prisma.artikelJurnal.findUnique({
            where: { id: artikelJurnalId },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Artikel jurnal tidak ditemukan" },
                { status: 404 }
            );
        }

        await prisma.artikelJurnal.delete({
            where: { id: artikelJurnalId },
        });

        return NextResponse.json({ message: "Artikel jurnal berhasil dihapus" });
    } catch (error) {
        console.error("DELETE Artikel Jurnal Error:", error);
        return NextResponse.json(
            { message: "Gagal menghapus artikel jurnal" },
            { status: 500 }
        );
    }
}
