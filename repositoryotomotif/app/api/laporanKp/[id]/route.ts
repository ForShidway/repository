import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const laporanId = Number(id);
        if (Number.isNaN(laporanId)) {
            return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
        }

        const laporan = await prisma.laporanKerjaPraktek.findUnique({
            where: { id: laporanId },
            include: { dosenPembimbing: true },
        });

        if (!laporan) {
            return NextResponse.json({ message: "Laporan Kerja Praktek tidak ditemukan" }, { status: 404 });
        }

        return NextResponse.json(laporan);
    } catch (error) {
        console.error("Error fetching laporan KP:", error);
        return NextResponse.json({ message: "Gagal mengambil data laporan Kerja Praktek" }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat menghapus laporan Kerja Praktek." },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const laporanId = Number(id);

        if (Number.isNaN(laporanId)) {
            return NextResponse.json(
                { message: "ID laporan KP tidak valid" },
                { status: 400 }
            );
        }

        const existing = await prisma.laporanKerjaPraktek.findUnique({
            where: { id: laporanId },
        });

        if (!existing) {
            return NextResponse.json(
                { message: "Laporan Kerja Praktek tidak ditemukan" },
                { status: 404 }
            );
        }

        await prisma.laporanKerjaPraktek.delete({
            where: { id: laporanId },
        });

        return NextResponse.json({ message: "Laporan Kerja Praktek berhasil dihapus" });
    } catch (error) {
        console.error("Delete Laporan KP Error", error);
        return NextResponse.json(
            { message: "Gagal menghapus laporan Kerja Praktek" },
            { status: 500 }
        );
    }
}
