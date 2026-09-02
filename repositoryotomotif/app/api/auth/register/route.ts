import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = body.name?.toString().trim();
        const email = body.email?.toString().trim().toLowerCase();
        const password = body.password?.toString().trim();

        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    message: "Nama, Email, dan Password harus diisi"
                }, { status: 400 }
            )
        }
        if(password.length < 8) {
            return NextResponse.json(
                { message: "Password minimal harus berisi 8 karakter"}, { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: {email},
        });

        if (existingUser) {
            return NextResponse.json(
                { message : "email sudah terdaftar " }, { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword,
                role : "MAHASISWA"
            }, select : {
                id: true,
                name: true,
                email: true, 
                role: true,
                createdAt: true,
            }
        })
        return NextResponse.json(
            { message: "Pendaftaran berhasil", user }, { status: 201 }
        );

    } catch (error) {
        console.error("Terjadi Error selama proses", error);
        return NextResponse.json(
            {
                message: "Terjadi kesalahan saat mendaftar"
            }, { status: 500}
        )
    }
}