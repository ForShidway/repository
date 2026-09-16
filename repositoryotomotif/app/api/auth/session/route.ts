import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(session.userId) || 0 },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({
                user: {
                    id: session.userId,
                    email: session.email,
                    name: session.email.split("@")[0],
                    role: session.role,
                },
            });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.email.split("@")[0],
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Session fetch error:", error);
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
