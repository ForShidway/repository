import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        // Verifikasi session hanya role DOSEN yang boleh akses
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (session.role !== "DOSEN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Ambil semua dosen beserta jumlah bimbingan masing-masing
        const dosens = await prisma.dosen.findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        pembimbingTa: true,
                        pembimbing2Ta: true,
                        dosenPa: true,
                        pengujiTa: true,
                        pembimbingPi: true,
                        pembimbingPlk: true,
                        penulisArtikel: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });

        // Statistik ringkasan keseluruhan
        const [
            totalDosen,
            totalTugasAkhir,
            totalLaporanPi,
            totalLaporanPlk,
            totalArtikelJurnal,
        ] = await Promise.all([
            prisma.dosen.count(),
            prisma.tugasAkhir.count(),
            prisma.laporanPi.count(),
            prisma.laporanPLK.count(),
            prisma.artikelJurnal.count(),
        ]);

        // Top 5 dosen berdasarkan jumlah bimbingan TA utama
        const topDosen = dosens
            .map((d) => ({
                id: d.id,
                name: d.name,
                totalBimbingan:
                    d._count.pembimbingTa +
                    d._count.pembimbing2Ta +
                    d._count.dosenPa,
                pembimbingUtama: d._count.pembimbingTa,
                pembimbingPendamping: d._count.pembimbing2Ta,
                dosenPa: d._count.dosenPa,
                penguji: d._count.pengujiTa,
                pembimbingPi: d._count.pembimbingPi,
                pembimbingPlk: d._count.pembimbingPlk,
                penuliArtikel: d._count.penulisArtikel,
            }))
            .sort((a, b) => b.totalBimbingan - a.totalBimbingan)
            .slice(0, 5);

        return NextResponse.json({
            summary: {
                totalDosen,
                totalTugasAkhir,
                totalLaporanPi,
                totalLaporanPlk,
                totalArtikelJurnal,
            },
            topDosen,
            dosenList: dosens.map((d) => ({
                id: d.id,
                name: d.name,
                pembimbingUtama: d._count.pembimbingTa,
                pembimbingPendamping: d._count.pembimbing2Ta,
                dosenPa: d._count.dosenPa,
                penguji: d._count.pengujiTa,
                pembimbingPi: d._count.pembimbingPi,
                pembimbingPlk: d._count.pembimbingPlk,
                penulisArtikel: d._count.penulisArtikel,
            })),
        });
    } catch (error) {
        console.error("Dosen Dashboard API Error:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data dashboard dosen" },
            { status: 500 }
        );
    }
}
