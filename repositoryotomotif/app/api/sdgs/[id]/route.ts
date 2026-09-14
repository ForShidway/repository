import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

type RouteContext = {
    params: Promise<{ id: string }>;
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
                { message: "ID SDGs tidak valid" },
                { status: 400 }
            );
        }
        const sdgs = await prisma.sDGs.findUnique({
            where: {
                id: sdgsId,
            },
        });
        if (!sdgs) {
            return NextResponse.json(
                { message: "SDGs tidak ditemukan" },
                { status: 404 }
            );
        }
        return NextResponse.json(sdgs);
    } catch (error) {
        console.error("Get SDGs error", error);
        return NextResponse.json(
            { message: "Gagal mengambil data SDGs" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    context: RouteContext
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
        if (Number.isNaN(sdgsId)) {
            return NextResponse.json(
                { message: "ID SDGs tidak valid" },
                { status: 400 }
            );
        }

        const existingSDGs = await prisma.sDGs.findUnique({
            where: { id: sdgsId },
        });
        if (!existingSDGs) {
            return NextResponse.json(
                { message: "SDGs tidak ditemukan" },
                { status: 404 }
            );
        }

        const contentType = request.headers.get("content-type") || "";

        let code = "";
        let title = "";
        let description: string | null = null;
        let imageUrl: string | null = existingSDGs.imageUrl;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            code = (formData.get("code")?.toString() || "").trim();
            title = (formData.get("title")?.toString() || "").trim();
            const descRaw = (formData.get("description")?.toString() || "").trim();
            description = descRaw || null;

            const removeImage = formData.get("removeImage") === "true";
            if (removeImage) {
                imageUrl = null;
            }

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
            if ("imageUrl" in body) {
                imageUrl = body.imageUrl;
            }
        }

        if (!code || !title) {
            return NextResponse.json(
                { message: "Kode dan Judul SDGs Wajib Diisi" },
                { status: 400 }
            );
        }

        const duplicateSDGs = await prisma.sDGs.findFirst({
            where: {
                code,
                NOT: { id: sdgsId },
            },
        });
        if (duplicateSDGs) {
            return NextResponse.json(
                { message: `Kode SDGs ${code} sudah digunakan` },
                { status: 409 }
            );
        }

        const updatedSDGs = await prisma.sDGs.update({
            where: { id: sdgsId },
            data: { code, title, description, imageUrl },
        });

        return NextResponse.json(updatedSDGs);
    } catch (error) {
        console.error("Updated SDGs Error", error);
        return NextResponse.json(
            { message: "Gagal memperbarui data SDGs" },
            { status: 500 }
        );
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
        const sdgsId = Number(id);
        if (Number.isNaN(sdgsId)) {
            return NextResponse.json(
                { message: "ID SDG tidak valid" },
                { status: 400 }
            );
        }

        const existingSDGs = await prisma.sDGs.findUnique({
            where: { id: sdgsId },
        });

        if (!existingSDGs) {
            return NextResponse.json(
                { message: "SDG tidak ditemukan" },
                { status: 404 }
            );
        }

        await prisma.sDGs.delete({
            where: { id: sdgsId },
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
