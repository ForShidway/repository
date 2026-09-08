import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const laporanPlkId = Number(id);

        if (Number.isNaN(laporanPlkId)) {
            return NextResponse.json(
                { message: "ID laporan PKL tidak valid" },
                { status: 400 }
            );
        }

        const laporanPlk = await prisma.laporanPLK.findUnique({
            where: { id: laporanPlkId },
            include: { dosenPembimbing: true },
        });

        if (!laporanPlk) {
            return NextResponse.json(
                { message: "Laporan PKL tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(laporanPlk);
    } catch (error) {
        console.error("Get Laporan PLK Detail Error", error);
        return NextResponse.json(
            { message: "Gagal mengambil data laporan PIK" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat menghapus laporan PLK." },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const laporanPlkId = Number(id);

        if (Number.isNaN(laporanPlkId)) {
            return NextResponse.json(
                { message: "ID laporan PI tidak valid" },
                { status: 400 }
            );
        }

        const existing = await prisma.laporanPLK.findUnique({
            where: { id: laporanPlkId },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Laporan PLK tidak ditemukan" },
                { status: 404 }
            );
        }

        await prisma.laporanPLK.delete({
            where: { id: laporanPlkId },
        });

        return NextResponse.json({ message: "Laporan PLK berhasil dihapus" });
    } catch (error) {
        console.error("Delete Laporan PI Error", error);
        return NextResponse.json(
            { message: "Gagal menghapus laporan PLK" },
            { status: 500 }
        );
    }
}