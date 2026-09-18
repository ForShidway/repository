//create api user

import { NextResponse } from "next/server";
import { prisma} from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

//untuk mengambil semua data user
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("GET USERS ERROR:", error);
        return NextResponse.json(
            {message : "Gagal mengambil data user"},
            {status : 500}
        );
    }
}

//untuk post 
export async function POST (request: Request) {
    try{
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat membuat user." },
                { status: 403 }
            );
        }
        
        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Nama, email, dan password harus diisi" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password minimal 8 karakter" },
                { status: 400 }
            );
        }

        const allowedRoles = ["ADMIN", "MAHASISWA", "DOSEN"];
        const finalRole = allowedRoles.includes(role) ? role : "MAHASISWA";

        const existingUser = await prisma.user.findUnique({
            where : { email,},
        });
        if (existingUser) {
            return NextResponse.json (
                {
                    message: "Email sudah digunkan",
                },
                { status: 409}
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data : {
                name,
                email,
                password: hashedPassword,
                role: finalRole,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user, {status: 201});
    } catch (error) {
        console.error("CREATE USER ERROR:", error);
        return NextResponse.json(
            {
                message: "Gagal membuat User",
            },
            {
                status:500
            }
        );
    }
}