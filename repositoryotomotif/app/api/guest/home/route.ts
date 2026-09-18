import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [
            totalTugasAkhir,
            totalDosen,
            totalRuangan,
            totalSDGs,
            tugasAkhirTerbaru,
            tugasAkhirYearRange,
            artikelJurnalYearRange,
            laporanPiYearRange,
            laporanPlkYearRange,
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
                    sdgs: true,
                    mahasiswa: {
                        orderBy: { urutan: "asc" }
                    }
                }
            }),
            prisma.tugasAkhir.aggregate({
                _min: { tahunMasuk: true },
                _max: { tahunMasuk: true },
            }),
            prisma.artikelJurnal.aggregate({
                _min: { tahun: true },
                _max: { tahun: true },
            }),
            prisma.laporanPi.aggregate({
                _min: { tanggalMulai: true },
                _max: { tanggalMulai: true },
            }),
            prisma.laporanPLK.aggregate({
                _min: { tanggalMulai: true },
                _max: { tanggalMulai: true },
            }),
        ]);

        const years = [
            tugasAkhirYearRange._min.tahunMasuk,
            tugasAkhirYearRange._max.tahunMasuk,
            artikelJurnalYearRange._min.tahun,
            artikelJurnalYearRange._max.tahun,
            laporanPiYearRange._min.tanggalMulai ? laporanPiYearRange._min.tanggalMulai.getFullYear() : null,
            laporanPiYearRange._max.tanggalMulai ? laporanPiYearRange._max.tanggalMulai.getFullYear() : null,
            laporanPlkYearRange._min.tanggalMulai ? laporanPlkYearRange._min.tanggalMulai.getFullYear() : null,
            laporanPlkYearRange._max.tanggalMulai ? laporanPlkYearRange._max.tanggalMulai.getFullYear() : null,
        ].filter((year): year is number => typeof year === "number");

        const startYear = years.length ? Math.min(...years) : new Date().getFullYear();
        const endYear = years.length ? Math.max(...years) : new Date().getFullYear();

        return NextResponse.json({
            statistics: { totalTugasAkhir, totalDosen, totalRuangan, totalSDGs },
            periodeTersedia: `${startYear} - ${endYear}`,
            tugasAkhirTerbaru,
        });
    } catch (error) {
        console.error("GET HOME GUEST ERROR", error);
        return NextResponse.json(
            {
                message: "Gagal Mengambil data Utama Home",
            },
            { status: 500 }
        );
    }
}
