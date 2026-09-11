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
            include: { keywords: true, sdgs: true, penulis: {orderBy: {urutan: "asc"}} },
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
        
        const penulisRaw = formData.get("penulis");
        let penulisInput: { tipe: string; nama: string; nim?: string; dosenId?: number }[] = [];
        if (penulisRaw) {
            try {
                const parsed = JSON.parse(penulisRaw.toString());
                if (Array.isArray(parsed)) {
                    penulisInput = parsed.map((p: any) => ({
                        tipe: String(p.tipe ?? "").toUpperCase(),
                        nama: String(p.nama ?? "").trim(),
                        ...(p.nim ? { nim: String(p.nim).trim() } : {}),
                        ...(p.dosenId ? { dosenId: Number(p.dosenId) } : {}),
                    }));
                } else {
                    return NextResponse.json(
                        { message: "Format data penulis tidak valid" },
                        { status: 400 },
                    );
                }
            } catch (error) {
                console.error("Penulis Parsing Error:", error);
                return NextResponse.json(
                    { message: "Format data penulis tidak valid" },
                    { status: 400 },
                );
            }
        }

        if(penulisInput.length === 0) {
            return NextResponse.json(
                {message: "Minimal harus ada 1 Penulis"},
                { status: 400 }
            )
        }
        if(penulisInput.length > 10) {
            return NextResponse.json(
                {message: "Maksimal 10 penulis per artikel"},
                { status: 400 }
            )
        }

        const validTipe= ["MAHASISWA","DOSEN","LAINNYA"];
        for (const p of penulisInput) {
            if (!validTipe.includes(p.tipe)) {
                return NextResponse.json(
                    { message: "Tipe penulis tidak valid" },
                    { status: 400 }
                );
            }
            if (p.tipe === "MAHASISWA" && (!p.nama || !p.nim)) {
                return NextResponse.json(
                    { message: "Nama dan NIM wajib diisi untuk penulis bertipe Mahasiswa" },
                    { status: 400 }
                );
            }
            if (p.tipe === "DOSEN" && !p.dosenId) {
                return NextResponse.json(
                    { message: "Dosen wajib dipilih untuk penulis bertipe Dosen" },
                    { status: 400 }
                );
            }
            if (p.tipe === "LAINNYA" && !p.nama) {
                return NextResponse.json(
                    { message: "Nama wajib diisi untuk penulis bertipe Lainnya" },
                    { status: 400 }
                );
            }
        }
        const dosenIds = penulisInput
            .filter((p) => p.tipe === "DOSEN")
            .map((p) => p.dosenId!);

        const dosenList = dosenIds.length > 0
            ? await prisma.dosen.findMany({ where: { id: { in: dosenIds } } })
            : [];

        if (dosenList.length !== new Set(dosenIds).size) {
            return NextResponse.json(
                { message: "Salah satu dosen yang dipilih tidak ditemukan" },
                { status: 404 }
            );
        }

        const penulisFinal = penulisInput.map((p) => {
            if (p.tipe === "DOSEN") {
                const dosen = dosenList.find((d) => d.id === p.dosenId);
                return { tipe: p.tipe, nama: dosen?.name ?? "", dosenId: p.dosenId, nim: null };
            }
            if (p.tipe === "MAHASISWA") {
                return { tipe: p.tipe, nama: p.nama, nim: p.nim, dosenId: null };
            }
            return { tipe: p.tipe, nama: p.nama, nim: null, dosenId: null };
        });


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

        const sdgsRaw = formData.get("sdgsId");
        let sdgsId: number[] = [];
        if (sdgsRaw) {
            try {
                const parsed = JSON.parse(
                    sdgsRaw.toString()
                );
                if (Array.isArray(parsed)) {
                    sdgsId = parsed
                        .map((id) => Number(id))
                        .filter((id) => !Number.isNaN(id));

                }
                } catch (error) {
                    console.error(
                        "SDGs parsing error:",
                        error
                    );
                    return NextResponse.json(
                        {
                            message: "Format SDGs tidak valid",
                        },
                        {
                            status: 400,
                        }
                    );
                }
            }

            if (sdgsId.length === 0) {
                return NextResponse.json(
                    {
                        message:
                            "Minimal satu SDGs harus dipilih",
                    },
                    {
                        status: 400,
                    }
                );
            }
            
            const sdgs =
                await prisma.sDGs.findMany({
                    where: {
                        id: {
                            in: sdgsId,
                        },
                    },
                });


            if (sdgs.length !== sdgsId.length) {
                return NextResponse.json(
                    {
                        message:
                            "Salah satu SDGs yang dipilih tidak ditemukan",
                    },
                    {
                        status: 404,
                    }
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
                tahun,
                judul,
                abstract,
                ProgramStudyId: programStudyId,
                sdgs: {
                    connect: sdgsId.map((id) => ({
                        id
                    }))
                },
                fileName: file?.name ?? null,
                filePath,
                fileSize: file?.size ?? null,
                fileType: file?.type ?? null,
                keywords: {
                    create: uniqueKeywords.map((kata) => ({ kata })),
                },
                penulis: {
                    create: penulisFinal.map((p, index) => ({
                        tipe: p.tipe as "MAHASISWA" | "DOSEN" | "LAINNYA",
                        nama: p.nama,
                        nim: p.nim,
                        dosenId: p.dosenId,
                        urutan: index + 1,
                    })),
                },
            },
            include: { keywords: true, sdgs: true, penulis: {
                orderBy: { urutan : "asc"}
            }},
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