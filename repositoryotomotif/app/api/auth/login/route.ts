import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = body.email?.toString().trim().toLowerCase();
        const password = body.password?.toString();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email dan password harus diisi" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Email atau password salah" },
                { status: 401 }
            );
        }

        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            return NextResponse.json(
                { message: "Email atau password salah" },
                { status: 401 }
            );
        }

        const token = await createToken({
            userId: user.id.toString(),
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json({
            message: "Login berhasil",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 hari, samakan dengan setExpirationTime di lib/auth.ts
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login Error", error);
        return NextResponse.json(
            { message: "Gagal melakukan login" },
            { status: 500 }
        );
    }
}