import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const [tugasAkhir, artikelJurnal, laporanPi, laporanPlk, laporanKp] = await Promise.all([
            prisma.tugasAkhir.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    programStudy: true,
                    pembimbing: true,
                    mahasiswa: { orderBy: { urutan: "asc" } },
                    sdgs: true,
                },
            }),
            prisma.artikelJurnal.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    programStudy: true,
                    sdgs: true,
                    penulis: { orderBy: { urutan: "asc" } },
                },
            }),
            prisma.laporanPi.findMany({
                orderBy: { createdAt: "desc" },
                include: { dosenPembimbing: true },
            }),
            prisma.laporanPLK.findMany({
                orderBy: { createdAt: "desc" },
                include: { dosenPembimbing: true },
            }),
            prisma.laporanKerjaPraktek.findMany({
                orderBy: { createdAt: "desc" },
                include: { dosenPembimbing: true },
            }),
        ]);

        const items = [
            ...tugasAkhir.map((item) => ({
                id: `tugas-akhir-${item.id}`,
                sourceId: item.id,
                jenis: "TUGAS AKHIR" as const,
                judul: item.judul,
                tahun: item.tahunMasuk,
                programStudy: item.programStudy,
                mahasiswa: item.mahasiswa,
                pembimbing: item.pembimbing,
                sdgs: item.sdgs,
                fileName: item.fileName,
                filePath: item.filePath,
                createdAt: item.createdAt,
            })),
            ...artikelJurnal.map((item) => ({
                id: `artikel-jurnal-${item.id}`,
                sourceId: item.id,
                jenis: "ARTIKEL JURNAL" as const,
                judul: item.judul,
                tahun: item.tahun,
                programStudy: item.programStudy,
                mahasiswa: item.penulis.map((penulisItem) => ({
                    id: penulisItem.id,
                    name: penulisItem.nama,
                    nim: penulisItem.nim ?? "",
                    urutan: penulisItem.urutan,
                })),
                pembimbing: null,
                sdgs: item.sdgs,
                fileName: item.fileName,
                filePath: item.filePath,
                createdAt: item.createdAt,
            })),
            ...laporanPi.map((item) => ({
                id: `laporan-pi-${item.id}`,
                sourceId: item.id,
                jenis: "LAPORAN PI" as const,
                judul: item.judul || `Laporan PI - ${item.name}`,
                tahun: item.tanggalMulai ? new Date(item.tanggalMulai).getFullYear() : new Date().getFullYear(),
                programStudy: null,
                mahasiswa: [{
                    id: item.id,
                    name: item.name,
                    nim: item.nim,
                    urutan: 1,
                }],
                pembimbing: item.dosenPembimbing,
                sdgs: [],
                fileName: item.fileName,
                filePath: item.filePath,
                createdAt: item.createdAt,
            })),
            ...laporanPlk.map((item) => ({
                id: `laporan-plk-${item.id}`,
                sourceId: item.id,
                jenis: "LAPORAN PLK" as const,
                judul: item.judul || `Laporan PLK - ${item.name}`,
                tahun: item.tanggalMulai ? new Date(item.tanggalMulai).getFullYear() : new Date().getFullYear(),
                programStudy: null,
                mahasiswa: [{
                    id: item.id,
                    name: item.name,
                    nim: item.nim,
                    urutan: 1,
                }],
                pembimbing: item.dosenPembimbing,
                sdgs: [],
                fileName: item.fileName,
                filePath: item.filePath,
                createdAt: item.createdAt,
            })),
            ...laporanKp.map((item) => ({
                id: `laporan-kp-${item.id}`,
                sourceId: item.id,
                jenis: "LAPORAN KP" as const,
                judul: item.judul || `Laporan KP - ${item.name}`,
                tahun: item.tanggalMulai ? new Date(item.tanggalMulai).getFullYear() : new Date().getFullYear(),
                programStudy: null,
                mahasiswa: [{
                    id: item.id,
                    name: item.name,
                    nim: item.nim,
                    urutan: 1,
                }],
                pembimbing: item.dosenPembimbing,
                sdgs: [],
                fileName: item.fileName,
                filePath: item.filePath,
                createdAt: item.createdAt,
            })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(items);
    } catch (error) {
        console.error("GET GUEST REPOSITORY ERROR", error);
        return NextResponse.json(
            { message: "Gagal mengambil data repository" },
            { status: 500 },
        );
    }
}
