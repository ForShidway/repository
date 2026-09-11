import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "path";

export async function GET() {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();

        const [
            totalTugasAkhir,
            totalDosen,
            totalRuangan,
            totalSDGs,
            totalUser,
            totalProgramStudy,
            totalArtikelJurnal,
            totalLaporanPi,
            totalLaporanPlk,
        ] = await Promise.all([
            prisma.tugasAkhir.count(),
            prisma.dosen.count(),
            prisma.ruangan.count(),
            prisma.sDGs.count({
                where: {
                    isActive: true,
                },
            }),
            prisma.user.count(),
            prisma.programStudy.count({
                where: {
                    isActive: true,
                },
            }),
            prisma.artikelJurnal.count(),
            prisma.laporanPi.count(),
            prisma.laporanPLK.count(),
        ]);

        //tugas akhir
        const startYear = currentYear - 5;
        const tugasAkhirSemua = await prisma.tugasAkhir.findMany({
            select: {
                tahunMasuk: true,
            },
        });

        const tugasPerTahun = Array.from({ length: 6 }, (_, index) => {
            const tahun = startYear + index;

            return {
                tahun,
                jumlah: tugasAkhirSemua.filter(
                    (ta) => ta.tahunMasuk === tahun
                ).length,
            };
        });

        const programStudies = await prisma.programStudy.findMany({
            where: {
                isActive: true,
            },
            include: {
                tugasAkhirs: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const distribusiProgramStudy = programStudies
            .map((programStudy) => ({
                id: programStudy.id,
                name: programStudy.name,
                degree: programStudy.degree,
                jumlah: programStudy.tugasAkhirs.length,
            }))
            .sort((a, b) => b.jumlah - a.jumlah);

        const tugasAkhirTerbaru = await prisma.tugasAkhir.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
            include: {
                programStudy: true,
                pembimbing: true,
                mahasiswa: true,
            },
        });

        const sdgsList = await prisma.sDGs.findMany({
            where : { isActive: true },
            include : {
                tugasAkhirs: {
                    select: { id:true },
                }
            }
        });
        const distribusiSdgs = sdgsList.map((sdg) => ({
            id: sdg.id,
            code: sdg.code,
            title: sdg.title,
            jumlah: sdg.tugasAkhirs.length,
        })) 
        .sort((a,b) => {
            const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
            const numB = parseInt(b.code.replace(/\D/g,"")) || 0;
            return numA - numB;
        })

        const aktivitasTerbaru = await prisma.tugasAkhir.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 6,
            select: {
                id: true,
                judul: true,
                fileName: true,
                createdAt: true,
                mahasiswa: {
                    select: {
                        name: true,
                        nim: true,
                    },
                },
            },
        });

        //artikel jurnal
        
        const artikelJurnalSemua = await prisma.artikelJurnal.findMany({
            select: {
                tahun: true,
            },
        });

        const artikelPerTahun = Array.from({ length: 6 }, (_, index) => {
            const tahun = startYear + index;

            return {
                tahun,
                jumlah: artikelJurnalSemua.filter(
                    (aj) => aj.tahun === tahun
                ).length,
            };
        });

        const programStudies1 = await prisma.programStudy.findMany({
            where: {
                isActive: true,
            },
            include: {
                artikelJurnals: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const distribusiProgramStudy1 = programStudies1
            .map((programStudy) => ({
                id: programStudy.id,
                name: programStudy.name,
                degree: programStudy.degree,
                jumlah: programStudy.artikelJurnals.length,
            }))
            .sort((a, b) => b.jumlah - a.jumlah);

        const artikelJurnalTerbaruRaw = await prisma.artikelJurnal.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
            include: {
                programStudy: true,
                penulis: {
                    orderBy: { urutan: "asc" },
                },
            },
        });

        const artikelJurnalTerbaru = artikelJurnalTerbaruRaw.map((item) => ({
            ...item,
            mahasiswa: item.penulis.map((penulisItem) => ({
                id: penulisItem.id,
                name: penulisItem.nama,
                nim: penulisItem.nim ?? "",
                urutan: penulisItem.urutan,
            })),
        }));

        //laporan pi
        const laporanPiSemua = await prisma.laporanPi.findMany({
            select: {
                tanggalMulai: true,
            },
        });
        const laporanPiPerTahun = Array.from({ length: 6 }, (_, index) => {
            const tahun = startYear + index;
            return {
                tahun,
                jumlah: laporanPiSemua.filter(
                    (laporan) => laporan.tanggalMulai.getFullYear() === tahun
                ).length,
            };
        });

        const laporanPlkSemua = await prisma.laporanPLK.findMany({
            select: {
                tanggalMulai: true,
            },
        });
        const laporanPlkPerTahun = Array.from({ length: 6 }, (_, index) => {
            const tahun = startYear + index;
            return {
                tahun,
                jumlah: laporanPlkSemua.filter(
                    (laporan) => laporan.tanggalMulai.getFullYear() === tahun
                ).length,
            };
        });

        return NextResponse.json({
            summary: {
                totalTugasAkhir,
                totalDosen,
                totalRuangan,
                totalSDGs,
                totalUser,
                totalProgramStudy,
                totalMahasiswa: totalTugasAkhir,
                totalArtikelJurnal,
                totalLaporanPi,
                totalLaporanPlk,
            },
            tugasPerTahun,
            artikelPerTahun,
            laporanPiPerTahun,
            laporanPlkPerTahun,
            distribusiProgramStudy,
            distribusiArtikelProgramStudy: distribusiProgramStudy1,
            distribusiSdgs,
            tugasAkhirTerbaru,
            artikelJurnalTerbaru,
            aktivitasTerbaru,
        });
    } catch (error) {
        console.error("Admin Statistics Error:", error);

        return NextResponse.json(
            {
                message: "Gagal mengambil statistik admin",
            },
            {
                status: 500,
            }
        );
    }
}
