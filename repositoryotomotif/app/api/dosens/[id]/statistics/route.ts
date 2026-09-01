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
        const currentYear =  new Date().getFullYear();
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
            }, _count: { id: true},
            orderBy: { tahunMasuk: "asc"}
        });
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

        return NextResponse.json ({
            dosen: {
                id: dosen.id,
                name: dosen.name,
            }, statistik : {
                currentYear, bimbinganTahunIni, totalBimbingan, statistikPerTahun, statistikPerProgramStudy,
            }, tugasAkhir,
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