import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function GET() {
    try {
        const artikelJurnal = await prisma.artikelJurnal.findMany({
            orderBy: { createdAt: "desc" },
            include: { keywords: true },
        });

        return NextResponse.json(artikelJurnal);
    } catch (error) {
        console.error("Error fetching artikel jurnal:", error);
        return NextResponse.json(
            { error: "Gagal mengambil artikel jurnal" },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    let savedFilePath: string | null = null;

    try {
        const formData = await request.formData();
        const name = formData.get("name")?.toString().trim() ?? "";
        const nim = formData.get("nim")?.toString().trim() ?? "";
        const judul = formData.get("judul")?.toString().trim() ?? "";
        const abstract = formData.get("abstract")?.toString().trim() ?? "";
        const tahunRaw = formData.get("tahun")?.toString().trim() ?? "";
        const tahun = Number(tahunRaw);
        const programStudyIdRaw = formData.get("programStudyId")?.toString().trim() ?? "";
        const programStudyId = Number(programStudyIdRaw);
        const fileEntry = formData.get("file");
        const file = fileEntry instanceof File && fileEntry.size > 0
            ? fileEntry
            : null;

        if (
            !name ||
            !nim ||
            !judul ||
            !abstract ||
            !tahunRaw ||
            !Number.isInteger(tahun) ||
            !programStudyIdRaw ||
            !Number.isInteger(programStudyId)
        ) {
            return NextResponse.json(
                { message: "name, nim, tahun, judul, abstract, dan program studi wajib diisi" },
                { status: 400 },
            );
        }

        const programStudy = await prisma.programStudy.findUnique({
            where: { id: programStudyId },
            select: { id: true },
        });
        if (!programStudy) {
            return NextResponse.json(
                { message: "Program studi tidak ditemukan" },
                { status: 400 },
            );
        }

        const abstractWordCount = abstract.split(/\s+/).filter(Boolean).length;
        if (abstractWordCount > 350) {
            return NextResponse.json(
                { message: `Abstract maksimal 350 kata (saat ini ${abstractWordCount} kata)` },
                { status: 400 },
            );
        }

        const keywordsValues = formData.getAll("keywords");
        const keywords: string[] = [];
        for (const value of keywordsValues) {
            try {
                const parsed = JSON.parse(value.toString());
                if (Array.isArray(parsed)) {
                    keywords.push(...parsed.map(String));
                } else {
                    keywords.push(value.toString());
                }
            } catch {
                keywords.push(value.toString());
            }
        }

        const uniqueKeywords = Array.from(
            new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean)),
        );
        if (uniqueKeywords.length > 5) {
            return NextResponse.json(
                { message: "Maksimal 5 kata kunci" },
                { status: 400 },
            );
        }

        if (file && file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { message: "Maksimal ukuran file adalah 100 MB" },
                { status: 400 },
            );
        }

        if (file && !ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { message: "File hanya boleh PDF, DOC, atau DOCX" },
                { status: 400 },
            );
        }

        let fileName: string | null = null;
        let filePath: string | null = null;
        if (file) {
            const uploadDir = path.join(process.cwd(), "public", "uploads", "artikel-jurnal");
            await fs.mkdir(uploadDir, { recursive: true });

            const extension = path.extname(file.name).toLowerCase();
            fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
            const physicalFilePath = path.join(uploadDir, fileName);
            await fs.writeFile(physicalFilePath, Buffer.from(await file.arrayBuffer()));
            savedFilePath = physicalFilePath;
            filePath = `/uploads/artikel-jurnal/${fileName}`;
        }

        const artikelJurnal = await prisma.artikelJurnal.create({
            data: {
                name,
                nim,
                tahun,
                judul,
                abstract,
                ProgramStudyId: programStudyId,
                fileName: file?.name ?? null,
                filePath,
                fileSize: file?.size ?? null,
                fileType: file?.type ?? null,
                keywords: {
                    create: uniqueKeywords.map((kata) => ({ kata })),
                },
            },
            include: { keywords: true },
        });

        return NextResponse.json(artikelJurnal, { status: 201 });
    } catch (error) {
        if (savedFilePath) {
            await fs.unlink(savedFilePath).catch(() => undefined);
        }
        console.error("Error creating artikel jurnal:", error);
        return NextResponse.json(
            { error: "Gagal membuat artikel jurnal" },
            { status: 500 },
        );
    }
}