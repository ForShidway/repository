import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(){
    try {
        const tugasAkhir = await prisma.tugasAkhir.findMany({
            orderBy: {
                createdAt : "desc",
            }, include : {
                ruangan: true,
                pembimbing:  true,
                dosenPa: true,
                sdgs: true,
            }
        })
        return NextResponse.json(tugasAkhir);
    } catch (error) {
        console.error("Get Tugas Akhir Error", error);
        return NextResponse.json(
            { message : "Gagal mengambil data tugas akhir"},
            { status : 500 }
        )
    }
}

export async function POST(request: Request) {
    try{
        const formData= await request.formData();
        const name = formData.get("name")?.toString().trim();
        const tahunMasuk = Number(formData.get("tahunMasuk"));
        const nim = formData.get("nim")?.toString().trim();
        const judul = formData.get("judul")?.toString().trim();
        const mataKuliahRelevan = formData.get("mataKuliahRelevan")?.toString().trim();
        const ruanganId = Number(formData.get("ruanganId"));
        const pembimbingId = Number(formData.get("pembimbingId"));
        const dosenPaId = Number(formData.get("dosenPaId"));

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

        const file = formData.get("file") as File | null;

        const MAX_FILE_SIZE = 200*1024*1024;
        if ( file && file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    message: "Maksimal ukuran file yang diterima adalah 200 MB"
                }, { status: 400 }
            );
        }

        const allowedTypes = [
            "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (file && !allowedTypes.includes(file.type)) {
            return NextResponse.json (
                {
                    message: "File hanya boleh PDF, DOC, atau DOCX"
                }, { status : 400}
            )
        }

        if(
            !name || !tahunMasuk || !nim || !judul || ! mataKuliahRelevan || !ruanganId || !pembimbingId || !dosenPaId
        ) {
            return NextResponse.json(
                { message : "semua data harus diisi"},
                { status: 400}
            );
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

        const existingTugasAkhir = await prisma.tugasAkhir.findUnique({
            where :   { 
                nim,
            }
        })

        if (existingTugasAkhir) {
            return NextResponse.json(
                { message : "Nim tersebut telah terdaftar"},
                { status : 409 }
            )
        }

        const ruangan = await prisma.ruangan.findUnique({
            where: {
                id: ruanganId,
            }
        })

        if (!ruangan) {
            return NextResponse.json (
                {
                    message : "Ruangan tidak ditemukan"
                },
                { status: 404}
            )
        }

        const pembimbing = await prisma.dosen.findUnique({
            where: {
                id: pembimbingId
            }
        })

        if (!pembimbing) {
            return NextResponse.json(
                { message : "Data Pembimbing tidak ditemukan"},
                { status: 404}
            )
        }

        const dosenPa = await prisma.dosen.findUnique ({
            where: {
                id: dosenPaId,
            }
        })

        if (!dosenPa) {
            return NextResponse.json(
                { message : "Dosen Pa tidak ditemukan" },
                { status : 404}
            )
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

        // ==========================================
// STEP 9 — SIMPAN FILE
// ==========================================

        let uniqueFileName: string | null = null;
        let filePath: string | null = null;

        if (file) {
            const uploadDir = path.join(
                process.cwd(),
                "public",
                "uploads",
                "tugas-akhir"
            );

            await fs.mkdir(uploadDir, {
                recursive: true,
            });

            const fileExtension = file.name.split(".").pop();

            uniqueFileName =
                `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

            const physicalFilePath = path.join(
                uploadDir,
                uniqueFileName
            );

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            await fs.writeFile(
                physicalFilePath,
                buffer
            );

            filePath = `/uploads/tugas-akhir/${uniqueFileName}`;
        }
        

        const tugasAkhir = await prisma.tugasAkhir.create ({
            data: {
                name, tahunMasuk, nim, judul, mataKuliahRelevan, ruanganId, pembimbingId, dosenPaId, 
                fileName: file?.name ?? null,
                filePath,
                fileSize: file?.size ?? null,
                fileType: file?.type ?? null,
                sdgs:{ connect: sdgsId.map((id) => ({
                    id,
                }))}
            }, include : {
                ruangan: true,
                pembimbing: true,
                dosenPa: true,
                sdgs: true
            }
        });
        return NextResponse.json(
            tugasAkhir, {
                status : 201
            }
        );
    } catch (error){
        console.error("Create Tugas Akhir Error",  error);
        return NextResponse.json (
            { message : "Gagal memuat data tugas akhir"},
            { status: 500}
        )
    }
}