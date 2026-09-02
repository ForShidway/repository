import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import { getSession } from "@/lib/auth";

type RouteContext = {
    params: Promise<{id: string}>;
};

export async function GET(
    request: Request,
    context: RouteContext
) {
    try { 
        const { id } = await context.params;
        const sdgsId = Number(id);
        if (Number.isNaN(sdgsId)) {
            return NextResponse.json(
                { message : "ID SDGS tidak valid"},
                { status : 400}
            );
        }
        const sdgs = await prisma.sDGs.findUnique({
            where: {
                id: sdgsId,
            }
        })
        if (!sdgs) {
            return NextResponse.json(
                { message : "SDGs tidak ditemukan "},
                { status : 404}
            );
        }
        return NextResponse.json (sdgs);

    } catch (error) {
        console.error("Get SDGs error", error);
        return NextResponse.json(
            { message : "Gagal mengambil data sdgs"},
            { status : 500},
        );
    }
}

export async function PUT(
    request : Request,
    context : RouteContext
) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat memperbarui SDGs." },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const sdgsId = Number(id);
        if(Number.isNaN(sdgsId)) {
            return NextResponse.json(
                {
                    message : "Id SDGs tidak valid"
                },
                { status : 400}
            )
        }
        const body = await request.json();
        const code = body.code?.trim();
        const title = body.title?.trim();
        const description = body.description?.trim() || null;
        if (!code || !title) {
            return NextResponse.json(
                { message :"Kode dan Judul SDGs Wajib Diisi" },
                { status: 400}
            );
        }

        const existingSDGs = await prisma.sDGs.findUnique({
            where: {
                id: sdgsId,
            }
        })
        if (!existingSDGs) {
            return NextResponse.json(
                {message : "SDGs tidak ditemukan"},
                { status : 404 }
            )
        }
        const duplicateSDGs = await prisma.sDGs.findFirst({
            where: {
                code, NOT: { id: sdgsId}
            }
        });
        if (duplicateSDGs) {
            return NextResponse.json(
                { message : `kode SDGs ${code} sudah digunakan`},
                { status: 409 }
            );
        }
        const updatedSDGs = await prisma.sDGs.update({
            where: {
                id: sdgsId,
            }, data : { code, title, description,}
        });
        return NextResponse.json(updatedSDGs);
    } catch (error) {
        console.error("Updated SDGs Error", error);
        return NextResponse.json(
            { message : "Gagal memperbaharui data SDGs"},
            { status: 500}
        )
    }
}

export async function DELETE(
    request: Request,
    context: RouteContext
) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat menghapus SDGs." },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const sdgsId= Number(id);
        if(Number.isNaN(sdgsId)) {
            return NextResponse.json(
                { message: "ID SDG tidak valid"},
                { status: 400}
            )
        }
        const existingSDGs = await prisma.sDGs.findUnique({
            where: {
                id: sdgsId,
            },
        });

        if (!existingSDGs) {
            return NextResponse.json(
                {
                    message: "SDG tidak ditemukan",
                },{ status: 404,}
            );
        }
        await prisma.sDGs.delete({
            where: {
                id: sdgsId,
            },
        });

        return NextResponse.json({
            message: "SDG berhasil dihapus",
        });
    } catch (error) {
        console.error("Delete SDGs error", error);
        return NextResponse.json(
            { message: "Gagal menghapus data SDGs" },
            { status: 500 }
        );
    }
}
