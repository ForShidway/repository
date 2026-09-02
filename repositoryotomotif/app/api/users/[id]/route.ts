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
        const userId = Number(id);
        if (Number.isNaN(userId)) {
            return NextResponse.json(
                {
                    message: "ID user tidak valid"
                },
                { status: 400, }
            )
        }

        const user = await prisma.user.findUnique({
            where : {
                id: userId,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    message: " User tidak ditemukan "
                },
                { status: 404,}
            )
        }
        return NextResponse.json(user);

    } catch (error) {
        console.error("GET User Error:" , error);
        return NextResponse.json(
            {
                message: "Gagal mengambil data user"
            }, {
                status: 500,
            }
        )
    }
}

//untuk updatae user lagi

export async function PUT(
    request: Request,
    context: RouteContext
) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat memperbarui user." },
                { status: 403 }
            );
        }
        const { id } = await context.params;
        const userId = Number(id);
        if (Number.isNaN(userId)) {
            return NextResponse.json(
                {
                    message: " ID user tidak valid"
                },
                { status: 400 }
            )
        }

        const body = await request.json();
        const name =  body.name?.trim();
        const email = body.email?.trim();


        if (!name || !email) {
            return NextResponse.json(
                { message: "Nama dan email wajib diisi"},
                { status: 400 }
            )
        }
        const existingUser = await prisma.user.findUnique(
            {
                where: {
                    id: userId,
                },
            }
        );

        if (!existingUser) {
            return NextResponse.json(
                {
                    message: "user tidak ditemukan"
                },
                { status: 404}
            )
        }

        const emailOwner = await prisma.user.findUnique({
            where : {
                email,
            }
        });

        if (emailOwner && emailOwner.id != userId) {
            return NextResponse.json(
                {
                    message: "Email sudah digunaan oleh user lain",
                },
                { status: 409 }
            );
        }

        // untuk update akun aik usernae dan gmail gunakan 
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            }, data: { name, email,}
        });
        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("PUT USER ERROR:",  error);

        return NextResponse.json(
            {
                message: "Gagal memperbarui data user"
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
                { message: "Akses ditolak. Hanya Admin yang dapat menghapus user." },
                { status: 403 }
            );
        }
        const{id} = await context.params;
        const userId = Number(id);
        if (Number.isNaN(userId)) {
            return NextResponse.json(
                {
                    message: "ID user tidak valid",
                },
                { status: 400,}
            )
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        if (!existingUser) {
            return NextResponse.json(
                {
                    message: "User tidak ditemukan"
                }, 
                { status: 404,}
            )
        }

        await prisma.user.delete({
            where: {
                id: userId,
            }
        });

        return NextResponse.json({
            message: "user berhasil dihapus"
        });
    } catch (error) {
        console.error("DELETE USER ERROR:", error);
        return NextResponse.json(
            {
                message: "Gagal menghapus user"
            },
            {
                status: 500,
            }
        )
    }
}