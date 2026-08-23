import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(){
    try {
        const tugasAkhir = await prisma.tugasAkhir.findMany({
            orderBy: {
                createdAt : "desc",
            }, include : {
                ruangan: true,
                pembimbing:  true,
                dosenPa: true,
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
        const body = await request.json();
        const name = body.name?.trim();
        const tahunMasuk = Number(body.tahunMasuk);
        const nim = body.nim?.trim();
        const judul = body.judul?.trim();
        const mataKuliahRelevan = body.mataKuliahRelevan?.trim();
        
        const ruanganId = Number(body.ruanganId);
        const pembimbingId = Number(body.pembimbingId);
        const dosenPaId = Number(body.dosenPaId);

        if(
            !name || !tahunMasuk || !nim || !judul || ! mataKuliahRelevan || !ruanganId || !pembimbingId || !dosenPaId
        ) {
            return NextResponse.json(
                { message : "semua data harus diisi"},
                { status: 400}
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

        const tugasAkhir = await prisma.tugasAkhir.create ({
            data: {
                name, tahunMasuk, nim, judul, mataKuliahRelevan, ruanganId, pembimbingId, dosenPaId,
            }, include : {
                ruangan: true,
                pembimbing: true,
                dosenPa: true
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