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
    let savedFilePathAktivitas: string | null = null;

    try {
        const formData = await request.formData();
        const name = formData.get("name")?.toString().trim() ?? "";
        const nim = formData.get("nim")?.toString().trim() ?? "";
        const judul = formData.get("judul")?.toString().trim() ?? "";
        const namaInstansi = formData.get("namaInstansi")?.toString().trim() ?? "";
        const alamat = formData.get("alamat")?.toString().trim() ?? "";
        const dosenPembimbingId = Number(formData.get("dosenPembimbingId"));
        const tanggalMulaiRaw = formData.get("tanggalMulai")?.toString();
        const tanggalSelesaiRaw = formData.get("tanggalSelesai")?.toString();

        const fileEntry = formData.get("file");
        const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

        const fileAktivitasEntry = formData.get("fileAktivitas");
        const fileAktivitas = fileAktivitasEntry instanceof File && fileAktivitasEntry.size > 0 ? fileAktivitasEntry : null;

        if (!name || !nim || !judul || !namaInstansi || !alamat || !dosenPembimbingId || !tanggalMulaiRaw || !tanggalSelesaiRaw) {
            return NextResponse.json(
                { message: "Silahkan lengkapi data yang wajib di isi" },
                { status: 400 },
            );
        }

        const parseDate = (val: string) => {
            if (/^\d{4}-\d{2}$/.test(val)) {
                return new Date(`${val}-01T00:00:00.000Z`);
            }
            return new Date(val);
        };

        const tanggalMulai = parseDate(tanggalMulaiRaw);
        const tanggalSelesai = parseDate(tanggalSelesaiRaw);

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

        // Validate file Laporan PLK
        if (file && file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { message: "Maksimal ukuran file Laporan PLK adalah 100 MB" },
                { status: 400 },
            );
        }

        if (file && !ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { message: "File Laporan PLK hanya boleh PDF, DOC, atau DOCX" },
                { status: 400 },
            );
        }

        // Validate file Laporan Aktivitas
        if (fileAktivitas && fileAktivitas.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { message: "Maksimal ukuran file Laporan Aktivitas adalah 100 MB" },
                { status: 400 },
            );
        }

        if (fileAktivitas && !ALLOWED_FILE_TYPES.includes(fileAktivitas.type)) {
            return NextResponse.json(
                { message: "File Laporan Aktivitas hanya boleh PDF, DOC, atau DOCX" },
                { status: 400 },
            );
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads", "laporan-Plk");
        await fs.mkdir(uploadDir, { recursive: true });

        // Save file Laporan PLK
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

        // Save file Laporan Aktivitas
        let uniqueFileNameAktivitas: string | null = null;
        let filePathAktivitas: string | null = null;

        if (fileAktivitas) {
            const fileExtension = fileAktivitas.name.split(".").pop() ?? "pdf";
            uniqueFileNameAktivitas = `aktivitas-${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
            const physicalFilePath = path.join(uploadDir, uniqueFileNameAktivitas);
            savedFilePathAktivitas = physicalFilePath;

            const bytes = await fileAktivitas.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await fs.writeFile(physicalFilePath, buffer);

            filePathAktivitas = `/uploads/laporan-Plk/${uniqueFileNameAktivitas}`;
        }

        const laporanPlk = await prisma.laporanPLK.create({
            data: {
                name,
                nim,
                judul,
                namaInstansi,
                alamat,
                dosenPembimbingId,
                tanggalMulai,
                tanggalSelesai,
                fileName: file?.name ?? "",
                filePath: filePath ?? "",
                fileSize: file?.size ?? 0,
                fileType: file?.type ?? "",
                fileNameAktivitas: fileAktivitas?.name ?? null,
                filePathAktivitas: filePathAktivitas ?? null,
                fileSizeAktivitas: fileAktivitas?.size ?? null,
                fileTypeAktivitas: fileAktivitas?.type ?? null,
            },
            include: { dosenPembimbing: true },
        });

        return NextResponse.json(laporanPlk, { status: 201 });
    } catch (error) {
        // Clean up both files on error
        if (savedFilePath) {
            await fs.unlink(savedFilePath).catch(() => undefined);
        }
        if (savedFilePathAktivitas) {
            await fs.unlink(savedFilePathAktivitas).catch(() => undefined);
        }
        console.error("Error creating Laporan Plk:", error);
        return NextResponse.json(
            { error: "Gagal membuat Laporan Plk" },
            { status: 500 },
        );
    }
}