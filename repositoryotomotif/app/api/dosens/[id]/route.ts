import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
type RouteContext = { params: Promise<{ id: string}> };

export async function GET( 
    request: Request,
    context: RouteContext
) {
    try {
        const { id } = await context.params;
        const dosenId = Number(id);
        if (Number.isNaN(dosenId)) {
            return NextResponse.json(
                {
                    message: "ID dosen tidak valid"
                },
                { status: 400, }
            )
        }

        const dosen = await prisma.dosen.findUnique({
            where : {
                id: dosenId,
            },
        });

        if (!dosen) {
            return NextResponse.json(
                {
                    message: " dosen tidak ditemukan "
                },
                { status: 404,}
            )
        }
        return NextResponse.json(dosen);

    } catch (error) {
        console.error("GET dosen Error:" , error);
        return NextResponse.json(
            {
                message: "Gagal mengambil data dosen"
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
        const { id } = await context.params;
        const dosenId = Number(id);
        if (Number.isNaN(dosenId)) {
            return NextResponse.json(
                {
                    message: " ID dosen tidak valid"
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
        const existingDosen = await prisma.dosen.findUnique(
            {
                where: {
                    id: dosenId,
                },
            }
        );

        if (!existingDosen) {
            return NextResponse.json(
                {
                    message: "dosen tidak ditemukan"
                },
                { status: 404}
            )
        }

        // untuk update 
        const updatedDosen = await prisma.dosen.update({
            where: {
                id: dosenId,
            }, data: { name,}
        });
        return NextResponse.json(updatedDosen)
    } catch (error) {
        console.error("PUT dosen ERROR:",  error);

        return NextResponse.json(
            {
                message: "Gagal memperbarui data dosen"
            }, { status: 500,}
        )
    }
}

export async function DELETE(
    request : Request,
    context : RouteContext
) {
    try {
        const{id} = await context.params;
        const dosenId = Number(id);
        if (Number.isNaN(dosenId)) {
            return NextResponse.json(
                {
                    message: "ID dosen tidak valid",
                },
                { status: 400,}
            )
        }
        const existingDosen = await prisma.dosen.findUnique({
            where: {
                id: dosenId,
            }
        });

        if (!existingDosen) {
            return NextResponse.json(
                {
                    message: "Dosen tidak ditemukan"
                }, 
                { status: 404,}
            )
        }

        await prisma.dosen.delete({
            where: {
                id: dosenId,
            }
        });

        return NextResponse.json({
            message: "dosen berhasil dihapus"
        });
    } catch (error) {
        console.error("DELETE DOSEN ERROR:", error);

        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "P2003"
        ) {
            return NextResponse.json(
                {
                    message: "Dosen tidak dapat dihapus karena masih digunakan pada data tugas akhir",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                message: "Gagal menghapus dosen"
            },
            {
                status: 500,
            }
        )
    }
}