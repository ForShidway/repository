import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const laporanPlks = await prisma.laporanPLK.findMany({
            orderBy: { createdAt: "desc" },
            include: { dosenPembimbing: true },
        });

        return NextResponse.json(laporanPlks);
    } catch (error) {
        console.error("Error fetching laporan PLK:", error);
        return NextResponse.json(
            { error: "Gagal mengambil laporan PLK" },
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
        const namaInstansi = formData.get("namaInstansi")?.toString().trim() ?? "";
        const dosenPembimbingId = Number(formData.get("dosenPembimbingId"));
        const tanggalMulaiRaw = formData.get("tanggalMulai")?.toString();
        const tanggalSelesaiRaw = formData.get("tanggalSelesai")?.toString();

        const fileEntry = formData.get("file");
        const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

        if (!name || !nim || !namaInstansi || !dosenPembimbingId || !tanggalMulaiRaw || !tanggalSelesaiRaw) {
            return NextResponse.json(
                { message: "Silahkan lengkapi data yang wajib di isi" },
                { status: 400 },
            );
        }

        const tanggalMulai = new Date(`${tanggalMulaiRaw}-01`);
        const tanggalSelesai = new Date(`${tanggalSelesaiRaw}-01`);

        if (Number.isNaN(tanggalMulai.getTime()) || Number.isNaN(tanggalSelesai.getTime())) {
            return NextResponse.json(
                { message: "Format periode ini tidak valid" },
                { status: 400 },
            );
        }

        if (tanggalSelesai < tanggalMulai) {
            return NextResponse.json(
                { message: "Periode Magang tidak valid" },
                { status: 400 },
            );
        }

        const dosen = await prisma.dosen.findUnique({
            where: { id: dosenPembimbingId },
        });

        if (!dosen) {
            return NextResponse.json(
                { message: "Dosen pembimbing tidak ditemukan" },
                { status: 404 },
            );
        }

        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        const ALLOWED_FILE_TYPES = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

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

        const uploadDir = path.join(process.cwd(), "public", "uploads", "laporan-Pi");
        await fs.mkdir(uploadDir, { recursive: true });

        let uniqueFileName: string | null = null;
        let filePath: string | null = null;

        if (file) {
            const fileExtension = file.name.split(".").pop() ?? "pdf";
            uniqueFileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
            const physicalFilePath = path.join(uploadDir, uniqueFileName);
            savedFilePath = physicalFilePath;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await fs.writeFile(physicalFilePath, buffer);

            filePath = `/uploads/laporan-Plk/${uniqueFileName}`;
        }

        const laporanPlk = await prisma.laporanPLK.create({
            data: {
                name,
                nim,
                namaInstansi,
                dosenPembimbingId,
                tanggalMulai,
                tanggalSelesai,
                fileName: file?.name ?? "",
                filePath: filePath ?? "",
                fileSize: file?.size ?? 0,
                fileType: file?.type ?? "",
            },
            include: { dosenPembimbing: true },
        });

        return NextResponse.json(laporanPlk, { status: 201 });
    } catch (error) {
        if (savedFilePath) {
            await fs.unlink(savedFilePath).catch(() => undefined);
        }
        console.error("Error creating Laporan Plk:", error);
        return NextResponse.json(
            { error: "Gagal membuat Laporan Plk" },
            { status: 500 },
        );
    }
}