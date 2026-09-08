import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type GroupBy = "tahun" | "prodi";

function parseYear(value: string | null, fallback: number) {
    const year = Number(value);
    return Number.isInteger(year) && year > 0 ? year : fallback;
}

function getDateRange(startYear: number, endYear: number) {
    return {
        gte: new Date(`${startYear}-01-01T00:00:00.000Z`),
        lt: new Date(`${endYear + 1}-01-01T00:00:00.000Z`),
    };
}

export async function GET(request: NextRequest) {
    try {
        const currentYear = new Date().getFullYear();
        const searchParams = request.nextUrl.searchParams;
        const groupBy: GroupBy = searchParams.get("groupBy") === "prodi" ? "prodi" : "tahun";
        const requestedStartYear = parseYear(searchParams.get("startYear"), currentYear - 4);
        const requestedEndYear = parseYear(searchParams.get("endYear"), currentYear);
        const startYear = Math.min(requestedStartYear, requestedEndYear);
        const endYear = Math.max(requestedStartYear, requestedEndYear);
        const rawProgramStudyId = searchParams.get("programStudyId");
        const programStudyId = rawProgramStudyId && rawProgramStudyId !== "all"
            ? Number(rawProgramStudyId)
            : undefined;
        const validProgramStudyId = typeof programStudyId === "number" && Number.isInteger(programStudyId) && programStudyId > 0
            ? programStudyId
            : undefined;

        const result = groupBy === "tahun"
            ? await getStatistikPerTahun(startYear, endYear, validProgramStudyId)
            : await getStatistikPerProdi(startYear, endYear, validProgramStudyId);

        return NextResponse.json({
            ...result,
            availableYears: await getRentangTahunTersedia(),
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Gagal mengambil data statistik gabungan" },
            { status: 500 }
        );
    }
}

async function getRentangTahunTersedia() {
    const [minTa, minAj, minLpi, minLplk] = await Promise.all([
        prisma.tugasAkhir.aggregate({ _min: { tahunMasuk: true } }),
        prisma.artikelJurnal.aggregate({ _min: { tahun: true } }),
        prisma.laporanPi.aggregate({ _min: { tanggalMulai: true } }),
        prisma.laporanPLK.aggregate({ _min: { tanggalMulai: true } }),
    ]);

    const currentYear = new Date().getFullYear();
    const minYear = Math.min(
        minTa._min.tahunMasuk ?? currentYear,
        minAj._min.tahun ?? currentYear,
        minLpi._min.tanggalMulai?.getFullYear() ?? currentYear,
        minLplk._min.tanggalMulai?.getFullYear() ?? currentYear
    );

    return { min: minYear, max: currentYear };
}

async function getStatistikPerTahun(
    startYear: number,
    endYear: number,
    programStudyId?: number
) {
    const years = Array.from(
        { length: endYear - startYear + 1 },
        (_, index) => startYear + index
    );
    const dateRange = getDateRange(startYear, endYear);

    const [taGrouped, ajGrouped, lpiGrouped, lplkGrouped] = await Promise.all([
        prisma.tugasAkhir.groupBy({
            by: ["tahunMasuk"],
            where: {
                tahunMasuk: { gte: startYear, lte: endYear },
                ...(programStudyId ? { ProgramStudyId: programStudyId } : {}),
            },
            _count: { _all: true },
        }),
        prisma.artikelJurnal.groupBy({
            by: ["tahun"],
            where: {
                tahun: { gte: startYear, lte: endYear },
                ...(programStudyId ? { ProgramStudyId: programStudyId } : {}),
            },
            _count: { _all: true },
        }),
        prisma.laporanPi.groupBy({
            by: ["tanggalMulai"],
            where: { tanggalMulai: dateRange },
            _count: { _all: true },
        }),
        prisma.laporanPLK.groupBy({
            by: ["tanggalMulai"],
            where: { tanggalMulai: dateRange },
            _count: { _all: true },
        }),
    ]);

    const taMap = new Map(taGrouped.map((item) => [item.tahunMasuk, item._count._all]));
    const ajMap = new Map(ajGrouped.map((item) => [item.tahun, item._count._all]));
    const lpiMap = new Map<number, number>();
    const lplkMap = new Map<number, number>();

    for (const item of lpiGrouped) {
        const year = item.tanggalMulai.getFullYear();
        lpiMap.set(year, (lpiMap.get(year) ?? 0) + item._count._all);
    }

    for (const item of lplkGrouped) {
        const year = item.tanggalMulai.getFullYear();
        lplkMap.set(year, (lplkMap.get(year) ?? 0) + item._count._all);
    }

    return {
        labels: years.map(String),
        series: {
            tugasAkhir: years.map((year) => taMap.get(year) ?? 0),
            artikelJurnal: years.map((year) => ajMap.get(year) ?? 0),
            laporanPi: years.map((year) => lpiMap.get(year) ?? 0),
            laporanPlk: years.map((year) => lplkMap.get(year) ?? 0),
        },
        catatan: "Laporan PI dan PLK belum terhubung ke program studi pada skema saat ini.",
    };
}

async function getStatistikPerProdi(
    startYear: number,
    endYear: number,
    programStudyId?: number
) {
    const prodiList = await prisma.programStudy.findMany({
        where: {
            isActive: true,
            ...(programStudyId ? { id: programStudyId } : {}),
        },
        select: { id: true, name: true, degree: true },
        orderBy: [{ degree: "asc" }, { name: "asc" }],
    });
    const programStudyIds = prodiList.map((programStudy) => programStudy.id);
    const dateRange = getDateRange(startYear, endYear);

    const [taGrouped, ajGrouped, lpiTotal, lplkTotal] = await Promise.all([
        prisma.tugasAkhir.groupBy({
            by: ["ProgramStudyId"],
            where: {
                tahunMasuk: { gte: startYear, lte: endYear },
                ProgramStudyId: { in: programStudyIds },
            },
            _count: { _all: true },
        }),
        prisma.artikelJurnal.groupBy({
            by: ["ProgramStudyId"],
            where: {
                tahun: { gte: startYear, lte: endYear },
                ProgramStudyId: { in: programStudyIds },
            },
            _count: { _all: true },
        }),
        prisma.laporanPi.count({ where: { tanggalMulai: dateRange } }),
        prisma.laporanPLK.count({ where: { tanggalMulai: dateRange } }),
    ]);

    const taMap = new Map(taGrouped.map((item) => [item.ProgramStudyId, item._count._all]));
    const ajMap = new Map(ajGrouped.map((item) => [item.ProgramStudyId, item._count._all]));

    return {
        labels: prodiList.map((programStudy) => `${programStudy.degree} ${programStudy.name}`),
        series: {
            tugasAkhir: prodiList.map((programStudy) => taMap.get(programStudy.id) ?? 0),
            artikelJurnal: prodiList.map((programStudy) => ajMap.get(programStudy.id) ?? 0),
            laporanPi: prodiList.map(() => 0),
            laporanPlk: prodiList.map(() => 0),
        },
        lpiTotal,
        lplkTotal,
        catatan: "Laporan PI dan PLK belum terhubung ke program studi pada skema saat ini, sehingga tidak ditampilkan per prodi.",
    };
}