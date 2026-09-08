//create  api dosen

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const dosens = await prisma.dosen.findMany({
            orderBy: {
                createdAt:"desc",
            }, include: {
                _count : {
                    select: {
                        pembimbingTa: true,
                        pembimbing2Ta: true,
                        pengujiTa: true,
                        pembimbingPi:true
                    }
                }
            }
        });
        const result = dosens.map((d) => ({
            id: d.id,
            name: d.name,
            totalBimbinganTa: d._count.pembimbingTa + d._count.pembimbing2Ta,
            totalPenguji: d._count.pengujiTa,
            totalPembimbingPi: d._count.pembimbingPi
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("GET DOSENS ERROR", error);
        return NextResponse.json(
            { message : "Gagal mengambil data dosen"},
            { status : 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        
                if (!session || session.role !== "ADMIN") {
                    return NextResponse.json(
                        { message: "Akses ditolak. Hanya Admin yang dapat memambahkan dosen." },
                        { status: 403 }
                    );
                }
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { message: "Silakan diinputkan nama dosen" },
                { status: 409 }
            );
        }
        const dosen = await prisma.dosen.create({
            data: {
                name,
            },
        });
        return NextResponse.json(dosen, {status: 201});
    } catch (error) {
        console.error("CREATE DOSEN ERROR:", error);
        return NextResponse.json(
            { message: "Gagal membuat dosen"},
            { status: 500 }
        )
    }
}