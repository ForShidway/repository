import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getSession } from "@/lib/auth";

export async function GET(){
    try {
        const tugasAkhir = await prisma.tugasAkhir.findMany({
            orderBy: {
                createdAt : "desc",
            }, include : {
                ruangan: true,
                pembimbing:  true,
                pembimbing2:  true,
                dosenPa: true,
                sdgs: true,
                programStudy: true,
                mahasiswa : { orderBy: { urutan : "asc"}},
                keywords: true,
                penguji: {
                    orderBy: { urutan: "asc" },
                    include: { dosen: true },
                }
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
        const session = await getSession();

        if (!session || session.role !== "MAHASISWA") {
            return NextResponse.json(
                { message: "Akses ditolak. Hanya Mahasiswa yang dapat membuat tugas akhir." },
                { status: 403 }
            );
        }
        const formData= await request.formData();
        const mahasiswasRaw = formData.get("mahasiswas");
        let mahasiswas: { name:string; nim:string}[] = [];
        if (mahasiswasRaw) {
            try {
                const parsed = JSON.parse(mahasiswasRaw.toString());
                    if (Array.isArray(parsed)) {mahasiswas = parsed.map((m) => ({
                        name: String(m.name ?? "").trim(),
                        nim: String(m.nim ?? "").trim(),
                    })) .filter((m) => m.name && m.nim);
                }
            } catch (error) {
                console.error("Mahasiswa error", error);
                return NextResponse.json (
                    { message: "Format data mahasiswa tidak valid"},
                    { status : 400}

                )
            }
        }
        if (mahasiswas.length === 0) {
            return NextResponse.json (
                { message: "minimal harus ada satu mahasiswa"},
                { status : 400}
            )
        }
        if (mahasiswas.length > 3) {
            return NextResponse.json (
                {  message : " jumlah maksimal jumlah mahasiswa untuk satu judu TA adalah 3" },
                { status: 400}

            )
        }
        const nimList = mahasiswas.map((m) => m.nim);
        const nimDuplikat = nimList.filter((nim, idx) => nimList.indexOf(nim) !==idx);
        if (nimDuplikat.length > 0) {
            return NextResponse.json (
                { message : `Nim ${nimDuplikat[0]} telah terdaftar, tidak boleh diinputkan 2 kali`},
                { status: 400}
            )
        }

        const abstractRaw  = formData.get("abstract");
        const abstract = abstractRaw ? abstractRaw.toString().trim() : null;
        if (abstract) {
            const wordCount = abstract.split(/\s+/).filter(Boolean).length;
            if (wordCount > 350) {
                return NextResponse.json (
                    {message: `Abstract Maksimal 350 kata, (saat ni ${wordCount} kata)`},
                    { status : 400}
                )
            } 
        }

        const keywordsRaw = formData.get("keywords")
        let keywords: string[] =[];
        if (keywordsRaw) {
            try {
                const parsed = JSON.parse(keywordsRaw.toString());
                if (Array.isArray(parsed)) {
                    keywords = parsed .map((k) => String(k).trimStart()) .filter ((k) => k.length > 0);
                }
            } catch (error) {
                console.error("Parsing Keyword tidak valid,", error);
                return NextResponse.json(
                    { message : "format kata kunci tidak valid"},
                    { status : 400 }
                )
            }
        }
        if (keywords.length > 5) {
            return NextResponse.json (
                { message : "maksimal kata kunci yang dimaukkna adalah 5"},
                { status : 400}
            )
        }


        const keywordsUnik = Array.from(new Set(keywords));
        const tahunMasuk = Number(formData.get("tahunMasuk"));
        const judul = formData.get("judul")?.toString().trim();
        const mataKuliahRelevanRaw = formData.get("mataKuliahRelevan")?.toString().trim();
        const mataKuliahRelevan = mataKuliahRelevanRaw ? mataKuliahRelevanRaw : null;
        const ruanganIdRaw = formData.get("ruanganId");
        const ruanganId = ruanganIdRaw ? Number(ruanganIdRaw) : null;
        const pembimbingId = Number(formData.get("pembimbingId"));
        const pembimbingId2 = formData.get("pembimbing2Id");
        const pembimbing2Id = pembimbingId2 ? Number(pembimbingId2) : null ;
        const dosenPaRaw = formData.get("dosenPaId");
        const dosenPaId = dosenPaRaw ? Number(dosenPaRaw) : null ;
        const pengujiRaw = formData.get("pengujiIds");
        let pengujiIds: number[] = [];
        if (pengujiRaw) {
            try {
                const parsed = JSON.parse(pengujiRaw.toString());
                if (!Array.isArray(parsed)) throw new Error("invalid");
                pengujiIds = parsed.map((id) => Number(id));
            } catch {
                return NextResponse.json(
                    { message: "Format dosen penguji tidak valid" },
                    { status: 400 },
                );
            }
        }
        const programStudyId = Number(formData.get("programStudyId"))

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
            !tahunMasuk || !judul || !pembimbingId  || !programStudyId
        ) {
            return NextResponse.json(
                { message : "semua data harus diisi"},
                { status: 400}
            );
        }

        if ( pembimbing2Id && pembimbing2Id === pembimbingId) {
            return NextResponse.json(
                { message: "Pembimbing 1 dan Pembimbing 2 tidak boleh orang yang sama"},
                { status : 400}
            )
        }

        if (pengujiIds.length > 3 || pengujiIds.some((id) => !Number.isInteger(id) || id <= 0)) {
            return NextResponse.json(
                { message: "Maksimal tiga dosen penguji dapat dipilih" },
                { status: 400 },
            );
        }
        if (new Set(pengujiIds).size !== pengujiIds.length) {
            return NextResponse.json(
                { message: "Dosen penguji tidak boleh dipilih lebih dari sekali" },
                { status: 400 },
            );
        }
        if (pengujiIds.some((id) => id === pembimbingId || id === pembimbing2Id || id === dosenPaId)) {
            return NextResponse.json(
                { message: "Dosen penguji harus berbeda dari dosen pembimbing dan dosen PA" },
                { status: 400 },
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

        const existingMahasiswa = await prisma.mahasiswa.findMany({
            where :   { 
                nim : { in: nimList },
            }, select: { nim:true},
        })

        if (existingMahasiswa.length > 0 ) {
            const nimTerdaftar = existingMahasiswa.map((m: { nim: string }) => m.nim).join(",")
            return NextResponse.json(
                { message : "Nim tersebut telah terdaftar"},
                { status : 409 }
            )
        }

        if (ruanganId) {
            const ruangan = await prisma.ruangan.findUnique({
                where: { id: ruanganId }
            })

            if (!ruangan) {
                return NextResponse.json(
                    { message: "Ruangan tidak ditemukan" },
                    { status: 404 }
                )
            }
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

        if (pembimbing2Id) {
            const pembimbing2 = await prisma.dosen.findUnique({
                where: {
                    id: pembimbing2Id
                }
            })

            if (!pembimbing2) {
                return NextResponse.json(
                    { message : "Data Pembimbing 2 tidak ditemukan"},
                    { status: 404}
                )
            }
        }
        
        if (dosenPaId) {
            const dosenPa = await prisma.dosen.findUnique({
                where: {
                    id: dosenPaId
                }
            })

            if (!dosenPa) {
                return NextResponse.json(
                    { message : "Data Dosen PA tidak ditemukan"},
                    { status: 404}
                )
            }
        }

        const pengujiDosens = pengujiIds.length > 0
            ? await prisma.dosen.findMany({ where: { id: { in: pengujiIds } }, select: { id: true } })
            : [];
        if (pengujiDosens.length !== pengujiIds.length) {
            return NextResponse.json(
                { message: "Salah satu dosen penguji tidak ditemukan" },
                { status: 404 },
            );
        }

        const programStudy = await prisma.programStudy.findUnique({
            where : {
                id: programStudyId,
            }
        })
        if(!programStudy) {
            return NextResponse.json(
                { message: "Program studi tidak ditemukan"},
                { status: 404}
            )
        }
        if (!programStudy.isActive) {
            return NextResponse.json(
                { message: "Program studi tidak aktif"},
                { status: 400}
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
                tahunMasuk, judul, abstract, mataKuliahRelevan, ruanganId, pembimbingId, pembimbing2Id, dosenPaId, ProgramStudyId : programStudyId,
                fileName: file?.name ?? null,
                filePath,
                fileSize: file?.size ?? null,
                fileType: file?.type ?? null,
                mahasiswa: {
                    create: mahasiswas.map((m, index) => ({
                        name: m.name, nim: m.nim, urutan: index + 1
                    }))
                },
                keywords : {
                    create: keywordsUnik.map((kata) => ({kata}))
                },
                sdgs:{ connect: sdgsId.map((id) => ({
                    id,
                }))},
                penguji: {
                    create: pengujiIds.map((dosenId, index) => ({
                        dosenId,
                        urutan: index + 1,
                        peran: index === 0 ? "KETUA" : index === 1 ? "SEKRETARIS" : "ANGGOTA",
                    })),
                },
            }, include : {
                ruangan: true,
                pembimbing: true,
                pembimbing2: true,
                dosenPa: true,
                sdgs: true,
                mahasiswa: {
                    orderBy : {urutan:"asc"},
                },
                penguji: {
                    orderBy: { urutan: "asc" },
                    include: { dosen: true },
                },
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