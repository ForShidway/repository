import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();

        // ==========================================
        // STATISTIK UTAMA
        // ==========================================

        const [
            totalTugasAkhir,
            totalDosen,
            totalRuangan,
            totalSDGs,
            totalUser,
            totalProgramStudy,
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
        ]);

        // ==========================================
        // JUMLAH TA PER TAHUN
        // ==========================================

        const startYear = currentYear - 5;

        const tugasAkhirSemua = await prisma.tugasAkhir.findMany({
            select: {
                tahunMasuk: true,
            },
        });

        const tugasPerTahun = Array.from(
            { length: 6 },
            (_, index) => {
                const tahun = startYear + index;

                return {
                    tahun,
                    jumlah: tugasAkhirSemua.filter(
                        (ta) => ta.tahunMasuk === tahun
                    ).length,
                };
            }
        );

        // ==========================================
        // DISTRIBUSI PROGRAM STUDI
        // ==========================================

        const programStudies =
            await prisma.programStudy.findMany({
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

        const distribusiProgramStudy =
            programStudies
                .map((programStudy) => ({
                    id: programStudy.id,
                    name: programStudy.name,
                    degree: programStudy.degree,
                    jumlah: programStudy.tugasAkhirs.length,
                }))
                .sort((a, b) => b.jumlah - a.jumlah);

        // ==========================================
        // TUGAS AKHIR TERBARU
        // ==========================================

        const tugasAkhirTerbaru =
            await prisma.tugasAkhir.findMany({
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
                include: {
                    programStudy: true,
                    pembimbing: true,
                },
            });

        // ==========================================
        // AKTIVITAS TERBARU
        // Untuk sekarang aktivitas dibuat dari
        // data TA terbaru karena belum ada
        // model LogAktivitas
        // ==========================================

        const aktivitasTerbaru =
            await prisma.tugasAkhir.findMany({
                orderBy: {
                    createdAt: "desc",
                },
                take: 6,
                select: {
                    id: true,
                    judul: true,
                    name: true,
                    fileName: true,
                    createdAt: true,
                },
            });

        // ==========================================
        // RESPONSE
        // ==========================================

        return NextResponse.json({
            summary: {
                totalTugasAkhir,
                totalDosen,
                totalRuangan,
                totalSDGs,
                totalUser,
                totalProgramStudy,

                // Karena NIM dibuat unique,
                // untuk sementara jumlah mahasiswa
                // yang memiliki TA = jumlah TA.
                totalMahasiswa: totalTugasAkhir,
            },

            tugasPerTahun,

            distribusiProgramStudy,

            tugasAkhirTerbaru,

            aktivitasTerbaru,
        });
    } catch (error) {
        console.error(
            "Admin Statistics Error:",
            error
        );

        return NextResponse.json(
            {
                message:
                    "Gagal mengambil statistik admin",
            },
            {
                status: 500,
            }
        );
    }
}