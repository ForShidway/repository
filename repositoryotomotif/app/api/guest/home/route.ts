import { NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [
            totalTugasAkhir, totalDosen, totalRuangan, totalSDGs, tugasAkhirTerbaru,
        ] = await Promise.all([
            prisma.tugasAkhir.count(),
            prisma.dosen.count(),
            prisma.ruangan.count(),
            prisma.sDGs.count(),
            prisma.tugasAkhir.findMany({
                take: 6,
                orderBy: {
                    createdAt: "desc"
                }, 
                include: {
                    ruangan: true,
                    pembimbing: true,
                    dosenPa: true,
                    sdgs : true,
                    mahasiswa: {
                        orderBy: { urutan: "asc" }
                    }
                }
            })    
        ]);
        return NextResponse.json (
            {
                statistics: { totalTugasAkhir, totalDosen, totalRuangan, totalSDGs },
                tugasAkhirTerbaru,
            }
        )
    } catch (error) {
        console.error("GET HOME GUEST ERROR", error)
        return NextResponse.json(
            {
                message: "Gagal Mengambil data Utama Home"
            },
            {status: 500}
        )
    }
}