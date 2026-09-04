import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const laporanPiId = Number(id);

        if (Number.isNaN(laporanPiId)) {
            return NextResponse.json(
                { message: "ID laporan PKL tidak valid" },
                { status: 400 }
            );
        }

        const laporanPi = await prisma.laporanPi.findUnique({
            where: { id: laporanPiId },
            include: { dosenPembimbing: true },
        });

        if (!laporanPi) {
            return NextResponse.json(
                { message: "Laporan PKL tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json(laporanPi);
    } catch (error) {
        console.error("Get Laporan PI Detail Error", error);
        return NextResponse.json(
            { message: "Gagal mengambil data laporan PI" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat menghapus laporan PI." },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const laporanPiId = Number(id);

        if (Number.isNaN(laporanPiId)) {
            return NextResponse.json(
                { message: "ID laporan PI tidak valid" },
                { status: 400 }
            );
        }

        const existing = await prisma.laporanPi.findUnique({
            where: { id: laporanPiId },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Laporan PI tidak ditemukan" },
                { status: 404 }
            );
        }

        await prisma.laporanPi.delete({
            where: { id: laporanPiId },
        });

        return NextResponse.json({ message: "Laporan PI berhasil dihapus" });
    } catch (error) {
        console.error("Delete Laporan PI Error", error);
        return NextResponse.json(
            { message: "Gagal menghapus laporan PI" },
            { status: 500 }
        );
    }
}