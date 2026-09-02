import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
type RouteContext = { params: Promise<{ id: string}> };
import {getSession} from "@/lib/auth";

export async function GET( 
    request: Request,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const ruanganId = Number(id);
        if (Number.isNaN(ruanganId)) {
            return NextResponse.json(
                {
                    message: "ID ruangan tidak valid"
                },
                { status: 400, }
            )
        }

        const ruangan = await prisma.ruangan.findUnique({
            where : {
                id: ruanganId,
            },
        });

        if (!ruangan) {
            return NextResponse.json(
                {
                    message: " ruangan tidak ditemukan "
                },
                { status: 404,}
            )
        }
        return NextResponse.json(ruangan);

    } catch (error) {
        console.error("GET ruangan Error:" , error);
        return NextResponse.json(
            {
                message: "Gagal mengambil data ruangan"
            }, {
                status: 500,
            }
        )
    }
}

//untuk updatae dosen lagi

export async function PUT(
    request: Request,
    context: RouteContext
) {
    try {
        const session = await getSession();
        
                if (!session || session.role !== "ADMIN") {
                    return NextResponse.json(
                        { message: "Akses ditolak. Hanya Admin yang dapat memperbarui ruangan." },
                        { status: 403 }
                    );
                }
        const { id } = await context.params;
        const ruanganId = Number(id);
        if (Number.isNaN(ruanganId)) {
            return NextResponse.json(
                {
                    message: " ID ruangan tidak valid"
                },
                { status: 400 }
            )
        }

        const body = await request.json();
        const name =  body.name?.trim();

        if (!name ) {
            return NextResponse.json(
                { message: "Nama wajib diisi"},
                { status: 400 }
            )
        }
        const existingRuangan = await prisma.ruangan.findUnique(
            {
                where: {
                    id: ruanganId,
                },
            }
        );

        if (!existingRuangan) {
            return NextResponse.json(
                {
                    message: "ruangan tidak ditemukan"
                },
                { status: 404}
            )
        }

        // untuk update 
        const updatedRuangan = await prisma.dosen.update({
            where: {
                id: ruanganId,
            }, data: { name,}
        });
        return NextResponse.json(updatedRuangan)
    } catch (error) {
        console.error("PUT ruangan ERROR:",  error);

        return NextResponse.json(
            {
                message: "Gagal memperbarui data ruangan"
            }, { status: 500,}
        )
    }
}

export async function DELETE(
    request : Request,
    context : RouteContext
) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat menghapus ruangan." },
                { status: 403 }
            );
        }
        const{id} = await context.params;
        const ruanganId = Number(id);
        if (Number.isNaN(ruanganId)) {
            return NextResponse.json(
                {
                    message: "ID ruangan tidak valid",
                },
                { status: 400,}
            )
        }
        const existingRuangan = await prisma.ruangan.findUnique({
            where: {
                id: ruanganId,
            }
        });

        if (!existingRuangan) {
            return NextResponse.json(
                {
                    message: "Ruangan tidak ditemukan"
                }, 
                { status: 404,}
            )
        }

        await prisma.ruangan.delete({
            where: {
                id: ruanganId,
            }
        });

        return NextResponse.json({
            message: "ruangan berhasil dihapus"
        });
    } catch (error) {
        console.error("DELETE RUANGAN ERROR:", error);
        return NextResponse.json(
            {
                message: "Gagal menghapus ruangan"
            },
            {
                status: 500,
            }
        )
    }
}