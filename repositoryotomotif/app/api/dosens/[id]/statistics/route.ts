import { NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request, 
    { params }: { params: Promise<{id:string}>}
) {
    try {
        const {id} = await params;
        const dosenId = Number(id);
        if (!Number.isInteger(dosenId)) {
            return NextResponse.json(
                { message: "ID dosen tidak valid"},
                { status: 400}
            );
        }

        const dosen = await prisma.dosen.findUnique({
            where: {
                id: dosenId,
            }
        });
        if (!dosen) {
            return NextResponse.json(
                {
                    message: "Dosen tidak ditemukan "
                }, { status: 404}
            );
        }
        const currentYear = new Date().getFullYear();
        const totalBimbingan = await prisma.tugasAkhir.count({
            where: {
                pembimbingId: dosenId,
            }
        });
        const bimbinganTahunIni = await prisma.tugasAkhir.count({
            where: {
                pembimbingId: dosenId,
                tahunMasuk: currentYear,
            }
        });
        const statistikTahun = await prisma.tugasAkhir.groupBy({
            by: ["tahunMasuk"],
            where: {
                pembimbingId: dosenId,
            },
            _count: { id: true },
            orderBy: { tahunMasuk: "asc" },
        });

        const pengujiRecords = await prisma.pengujiTugasAkhir.findMany({
            where: { dosenId: dosenId },
            include: {
                tugasAkhir: {
                    select: {
                        tahunMasuk: true,
                        programStudy: {
                            select: { id: true, name: true, degree: true },
                        },
                    },
                },
            },
        });

        const pengujiPerTahunMap = new Map<number, number>();
        for (const record of pengujiRecords) {
            const tahun = record.tugasAkhir.tahunMasuk;
            pengujiPerTahunMap.set(tahun, (pengujiPerTahunMap.get(tahun) ?? 0) + 1);
        }

        const pengujiPerTahun = Array.from(pengujiPerTahunMap.entries())
            .map(([tahun, jumlah]) => ({ tahun, jumlah }))
            .sort((a, b) => a.tahun - b.tahun);

        const totalMenguji = pengujiRecords.length;

        const pengujiPerProgramStudyMap = new Map<number, {
            id: number;
            name: string;
            degree: string;
            jumlah: number;
        }>();

        for (const record of pengujiRecords) {
            const programStudy = record.tugasAkhir.programStudy;
            if (!programStudy) continue;

            const current = pengujiPerProgramStudyMap.get(programStudy.id);
            pengujiPerProgramStudyMap.set(programStudy.id, {
                id: programStudy.id,
                name: programStudy.name,
                degree: programStudy.degree,
                jumlah: (current?.jumlah ?? 0) + 1,
            });
        }

        const statistikPerProgramStudyPenguji = Array.from(
            pengujiPerProgramStudyMap.values()
        ).sort((a, b) => b.jumlah - a.jumlah);

        const tugasAkhir = await prisma.tugasAkhir.findMany({
            where : {
                pembimbingId: dosenId,
            }, orderBy: [
                { tahunMasuk : "desc"}, { createdAt: "desc" }
            ], include: {
                programStudy: true,
                ruangan: true,
                sdgs: true,
                mahasiswa: {
                    orderBy: {
                        urutan: "asc",
                    },
                },
            }
        });
        const statistikProgramStudy = await prisma.tugasAkhir.groupBy({
            by: ["ProgramStudyId"],
            where: {
                pembimbingId: dosenId,
            },
            _count: { id: true },
        });
        const programStudyIds = statistikProgramStudy
            .map((item) => item.ProgramStudyId)
            .filter((id): id is number => id !== null);

        const programStudies = programStudyIds.length > 0 ? await prisma.programStudy.findMany({
            where: {
                id: {
                    in: programStudyIds
                }
            }
        }) : []

        const statistikPerProgramStudy = statistikProgramStudy.map((item) => {
            const programStudy = programStudies.find(
                    (program) => program.id === item.ProgramStudyId
                );
            return {
                id: item.ProgramStudyId,
                name: programStudy?.name ?? "Tidak diketahui",
                degree: programStudy?.degree ?? "-",
                jumlah: item._count.id,
            };
        });

        // Transform statistikTahun ke format yang sesuai dengan component
        const statistikPerTahun = statistikTahun.map((item) => ({
            tahun: item.tahunMasuk,
            jumlah: item._count.id,
        }));

        const laporanPi = await prisma.laporanPi.findMany({
            where: {
                dosenPembimbingId: dosenId,
            },
            select: {
                tanggalMulai: true,
            },
        });
        const laporanPiPerTahun = laporanPi.reduce<{ tahun: number; jumlah: number }[]>(
            (result, laporan) => {
                const tahun = laporan.tanggalMulai.getFullYear();
                const existing = result.find((item) => item.tahun === tahun);
                if (existing) {
                    existing.jumlah += 1;
                } else {
                    result.push({ tahun, jumlah: 1 });
                }
                return result;
            },
            []
        ).sort((a, b) => a.tahun - b.tahun);

        const laporanPlk = await prisma.laporanPLK.findMany({
            where: {
                dosenPembimbingId: dosenId,
            },
            select: {
                tanggalMulai: true,
            },
        });
        const laporanPlkPerTahun = laporanPlk.reduce<{ tahun: number; jumlah: number }[]>(
            (result, laporan) => {
                const tahun = laporan.tanggalMulai.getFullYear();
                const existing = result.find((item) => item.tahun === tahun);
                if (existing) {
                    existing.jumlah += 1;
                } else {
                    result.push({ tahun, jumlah: 1 });
                }
                return result;
            },
            []
        ).sort((a, b) => a.tahun - b.tahun);

        const pengujiTugasAkhir = pengujiRecords.map((record) => ({
            tahunMasuk: record.tugasAkhir.tahunMasuk,
            programStudy: record.tugasAkhir.programStudy,
        }));

        return NextResponse.json ({
            dosen: {
                id: dosen.id,
                name: dosen.name,
            }, statistik : {
                currentYear, bimbinganTahunIni, totalBimbingan, totalMenguji, statistikPerTahun, pengujiPerTahun, statistikPerProgramStudy, statistikPerProgramStudyPenguji, laporanPiPerTahun, laporanPlkPerTahun,
            }, tugasAkhir, pengujiTugasAkhir,
        });
    } catch (error) {
        console.error("Get Statistik Dosen Errord", error);
        return NextResponse.json (
            {
                message: "Gagal mengambil statik dosen"
            }, { status: 500 },
        )
    }
}