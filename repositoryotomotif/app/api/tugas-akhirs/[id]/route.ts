import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NestedMiddlewareError } from "next/dist/build/utils";

type RouteContex = {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    request: Request,
    context: RouteContex
) {
    try {
        const {id} = await context.params;
        const tugasAkhirId = Number(id);

        if (Number.isNaN(tugasAkhirId)) {
            return NextResponse.json(
                { message: "ID tugas akhir tidaak valid"},
                {status: 400}
            )
        }

        const tugasAkhir = await prisma.tugasAkhir.findUnique({
            where: {
                id : tugasAkhirId
            }, include : {
                ruangan: true,
                pembimbing: true,
                dosenPa: true
            }
        });

        if (!tugasAkhir) {
            return NextResponse.json(
                {
                    messaage: "Tugas akhir tidak ditemukan "
                }, { status : 404}
            )
        }
        return NextResponse.json(tugasAkhir)
     } catch (error) {
        console.error("Get Tugas Akhir Erro", error);
        return NextResponse.json (
            { message : "Gagal mengambil data user"},
            { status: 500 }
        )
     }
}

export async function DELETE(
    request: Request,
    context: RouteContex
) {
    try {
        const {id} = await context.params;
        const tugasAkhirId= Number(id);
        if ( Number.isNaN(tugasAkhirId)) {
            return NextResponse.json(
                { message : "ID tugas akhir tidak valid"},
                { status: 400}
            )
        }
        const existingTA = await prisma.tugasAkhir.findUnique({
            where: {
                id : tugasAkhirId
            }
        })

        if(!existingTA) {
            return NextResponse.json(
                { message: "Tugas Akhir Tidak Ditemukan "},
                { status: 404}
            )
        }
        
        await prisma.tugasAkhir.delete({
            where: {
                id: tugasAkhirId
            }
        })
        return NextResponse.json({
            message: " Data tugass akhir berhasil dihapus"
        })
    }  catch (error) {
        console.error ("Delete TA Error");
        return NextResponse.json (
            {
                message: "Gagal menghapus data tugas akhir"
            }, { status: 500 }
        )
    }
}
