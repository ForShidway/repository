import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const programStudies = await prisma.programStudy.findMany({
            orderBy: {
                createdAt: "desc",
            }
        });
        return NextResponse.json(programStudies);
    } catch (error){
        console.error("Get Program Studi Error", error);
        return NextResponse.json(
            { message : "Gagal mengambil data program studi" },
            { status : 500},
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat menambahkan program studi." },
                { status: 403 }
            );
        }
        const body = await request.json();
        const name = body.name?.trim();
        const degree =  body.degree?.trim();
        const description = body.description?.trim() || null;

        if (!name || !degree) {
            return NextResponse.json(
                { message : "Nama dan Jengjnag Program Studi wajib di isi"},
                { status: 400}
            );
        }

        const existingProgramStudy = await prisma.programStudy.findFirst({
            where: {
                name: {
                    equals : name,
                }, 
                degree: {
                    equals : degree,
                }
            }
        });

        if (existingProgramStudy) {
            return NextResponse.json(
                { message : `Program Studi ${degree} ${name} sudah terdaftar`, },
                { status : 409}
            );
        }

        const programStudy = await prisma.programStudy.create({
            data: {name, degree, description}
        });

        return NextResponse.json(programStudy, {
            status: 201}
        );
    } catch (error) {
        console.error("CREATE PROGRAM STUDY ERROR", error);
        return NextResponse.json(
            {
                message : "Gagal membuat Program Studi"
            },
            { status : 500}
        );
    }
}