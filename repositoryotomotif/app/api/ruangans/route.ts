import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const ruangans = await prisma.ruangan.findMany({
            orderBy: {
                createdAt:"desc",
            }
        });
        return NextResponse.json(ruangans);
    } catch (error) {
        console.error("GET RUANGAN ERROR", error);
        return NextResponse.json(
            { message : "Gagal mengambil data ruangan"},
            { status : 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { message: "Silakan diinputkan nama Ruangan" },
                { status: 409 }
            );
        }
        const ruangan = await prisma.ruangan.create({
            data: {
                name,
            },
        });
        return NextResponse.json(ruangan, {status: 201});
    } catch (error) {
        console.error("CREATE RUANGAN ERROR:", error);
        return NextResponse.json(
            { message: "Gagal membuat ruangan"},
            { status: 500 }
        )
    }
}