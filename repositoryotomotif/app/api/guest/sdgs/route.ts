import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const sdgsList = await prisma.sDGs.findMany({
            where: { isActive: true },
            include: {
                tugasAkhirs: {
                    select: { id: true },
                },
                artikelJurnal: {
                    select: { id: true },
                },
            },
            orderBy: { code: "asc" },
        });

        const data = sdgsList
            .map((sdg) => ({
                id: sdg.id,
                code: sdg.code,
                title: sdg.title,
                description: sdg.description,
                jumlahTA: sdg.tugasAkhirs.length,
                jumlahArtikel: sdg.artikelJurnal.length,
                jumlahTotal: sdg.tugasAkhirs.length + sdg.artikelJurnal.length,
            }))
            .sort((a, b) => {
                const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
                const numB = parseInt(b.code.replace(/\D/g, "")) || 0;
                return numA - numB;
            });

        return NextResponse.json(data);
    } catch (error) {
        console.error("GET GUEST SDGS ERROR", error);
        return NextResponse.json(
            { message: "Gagal mengambil data SDGs" },
            { status: 500 }
        );
    }
}
