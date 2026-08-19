//create api user

import { NextResponse } from "next/server";
import { prisma} from '@/lib/prisma';

//untuk mengambil semua data user
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("GET USERS ERRER:", error);
        return NextResponse.json(
            {message : "Gagal mengambil data user"},
            {status : 500}
        );
    }
}

//untuk post 
export async function POST (request: Request) {
    try{
        const body = await request.json();
        const {name, email} = body;
        if (!name || !email) {
            return NextResponse.json(
                { message: "Nama dan Email Harus di isi" },
                { status: 400 }
            );
        }
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
        const user = await prisma.user.create({
            data : {
                name, email,
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