import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ModelName } from "@/generated/prisma/internal/prismaNamespace";

type RouteContext = { params: Promise<{id: string}>};
export async function GET(
    request: Request,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const programStudyId = Number(id);
        if (Number.isNaN(programStudyId)) {
            return NextResponse.json(
                { message: "ID user tidak valid"},
                { status : 400}
            )
        }
        const programStudy = await prisma.programStudy.findUnique({
            where : {
                id: programStudyId,
            }
        });

        if (!programStudy) {
            return NextResponse.json(
                { message : "Tidak Ada Program Study yang ditemukan"},
                { status : 400}
            )
        }

        return NextResponse.json(programStudy);
    } catch (error) {
        console.error("Get Program Studi Error", error);
        return NextResponse.json(
            {
                message: "Gagal mengambil data user"
            }, {
                status: 500,
            }
        )
    }
}

export async function PUT(request: Request, context: RouteContext) {
    try {
        const {id} = await context.params;
        const programStudyId = Number(id);

        if (Number.isNaN(programStudyId)) {
            return NextResponse.json(
                { message : "ID program studi tidak valid"},
                { status : 400 }
            )
        }

        const body = await request.json();
        const name = body.name?.trim();
        const degree = body.degree?.trim();
        const description = body.description?.trim() || null;

        if (!name || !degree) {
            return NextResponse.json (
                { message : "Nama dan Jenjang Jendidikan Program Studi Harus diisi" },
                { status : 400 }
            )
        }
        
        const existingProgramStudy = await prisma.programStudy.findUnique({
            where : {
                id: programStudyId,
            }
        });
        
        
        
        if (!existingProgramStudy) {
            return NextResponse.json(
                { message: "Program studi tidak ditemuan"},
                { status : 404 }
            )
        }
        
        const duplicateProgramStudy = await prisma.programStudy.findFirst({
            where: {
                name,
                degree,
                NOT: {
                    id: programStudyId,
                },
            },
        });

        if (duplicateProgramStudy) {
            return NextResponse.json(
                { message: ` Program studi ${degree} ${name} sudah terdaftar`},
                { status : 409 }
            )
        }

        const updatedProgramStudy = await prisma.programStudy.update({
            where: {
                id: programStudyId,
            },
            data: {
                name, degree, description,
            }
        });

        return NextResponse.json(updatedProgramStudy);
    } catch (error){
        console.error("Update Program Study Error:", error);
        return NextResponse.json(
            { message: "Gagal memperbaharui program studi" },
            { status: 500 }
        );
    }

}

export async function DELETE(
    request: Request, context: RouteContext
) {
    try {
        const { id } = await context.params;
        const programStudyId = Number(id);
        if (Number.isNaN(programStudyId)) {
            return NextResponse.json(
                { message : "ID program studi tidak valid" },
                { status : 400}
            )
        }

        const existingProgramStudy = await prisma.programStudy.findUnique({
            where: {
                id: programStudyId,
            }
        })

        if (!existingProgramStudy) {
            return NextResponse.json(
                { message: " Program Studi Tidak Ditemukan"},
                { status: 404}
            )
        }

        await prisma.programStudy.delete({
            where: {
                id: programStudyId,
            }
        })
        return NextResponse.json({ message: "Program Studi berhasil dihapus"})
    } catch (error) {
        console.error("DELETE program study DONE", error);
        return NextResponse.json(
            {
                message: "Gagal menghapus Program Studi",
            },
            { status: 500}
        )
    }
}