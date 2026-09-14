import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function GET() {
    try {
        const sdgs = await prisma.sDGs.findMany({
            orderBy: {
                code: "asc",
            },
        });
        return NextResponse.json(sdgs);
    } catch (error) {
        console.error("Get SDGS Error", error);
        return NextResponse.json(
            { message: "Gagal mengambil data SDGs" },
            { status: 400 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session || session.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Admin yang dapat menambahkan SDGs." },
                { status: 403 }
            );
        }

        const contentType = request.headers.get("content-type") || "";

        let code = "";
        let title = "";
        let description: string | null = null;
        let imageUrl: string | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            code = (formData.get("code")?.toString() || "").trim();
            title = (formData.get("title")?.toString() || "").trim();
            const descRaw = (formData.get("description")?.toString() || "").trim();
            description = descRaw || null;

            const file = formData.get("image") as File | null;
            if (file && file.size > 0) {
                const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
                if (!allowedTypes.includes(file.type)) {
                    return NextResponse.json(
                        { message: "Format gambar logo hanya boleh PNG, JPG, WEBP, atau SVG" },
                        { status: 400 }
                    );
                }

                const uploadDir = path.join(process.cwd(), "public", "uploads", "sdgs");
                await fs.mkdir(uploadDir, { recursive: true });

                const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
                const fileName = `${Date.now()}-${sanitizeName}`;
                const filePath = path.join(uploadDir, fileName);

                const buffer = Buffer.from(await file.arrayBuffer());
                await fs.writeFile(filePath, buffer);

                imageUrl = `/uploads/sdgs/${fileName}`;
            }
        } else {
            const body = await request.json();
            code = (body.code || "").trim();
            title = (body.title || "").trim();
            description = (body.description || "").trim() || null;
            imageUrl = body.imageUrl || null;
        }

        if (!code || !title) {
            return NextResponse.json(
                { message: "Kode dan Judul SDG wajib diisi" },
                { status: 400 }
            );
        }

        const existingSDGs = await prisma.sDGs.findUnique({
            where: { code },
        });

        if (existingSDGs) {
            return NextResponse.json(
                { message: `Kode SDGs ${code} sudah terdaftar` },
                { status: 400 }
            );
        }

        const sdgs = await prisma.sDGs.create({
            data: {
                code,
                title,
                description,
                imageUrl,
            },
        });

        return NextResponse.json(sdgs, { status: 201 });
    } catch (error) {
        console.error("Create SDGs Error", error);
        return NextResponse.json(
            { message: "Gagal menambah data SDGs" },
            { status: 500 }
        );
    }
}