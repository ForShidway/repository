import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try{
        const sdgs = await prisma.sDGs.findMany({
            orderBy: {
                code: "asc",
            }
        })
        return NextResponse.json(sdgs);
    } catch (error) {
        console.error("Get SDGS Error", error);
        return NextResponse.json(
            { message : "Gagal mengambil data Sdgs"},
            { status : 400}
        );
    }
}

export async function POST(request: Request) {
    try{
        const session = await getSession();
        
            if (!session || session.role !== "ADMIN") {
                return NextResponse.json(
                    { message: "Akses ditolak. Hanya Admin yang dapat menambahkan SDGs." },
                    { status: 403 }
                );
            }

        const body = await request.json();
        const code = body.code?.trim();
        const title = body.title?.trim();
        const description = body.description?.trim() || null;

        if (!code || !title) {
            return NextResponse.json(
                { message : " Kode dan Judul SDG Wajib di isi"},
                { status : 400}
            )
        }
        const existingSDGs = await prisma.sDGs.findUnique(
            {
                where: {
                    code,
                }
            }
        );

        if (existingSDGs) {
            return NextResponse.json(
                { message : `kode SDGS ${code} sudah terdaftar`},
                { status: 400}
            )
        }
        const sdgs = await prisma.sDGs.create({
            data: {
                code, title, description,
            }
        });

        return NextResponse.json(sdgs, {status:201});
    } catch (error) {
        console.error("Create SDGs Error",  error)
        return NextResponse.json(
            {message : " Gagal menambah data SDGs"},
            { status: 500}
        )
    }
}