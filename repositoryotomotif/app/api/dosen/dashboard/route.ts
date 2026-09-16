import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        // Verifikasi session role DOSEN atau ADMIN
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (session.role !== "DOSEN" && session.role !== "ADMIN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // 1. Ambil semua dosen beserta relasi bimbingan, pengujian, dan publikasi
        const dosens = await prisma.dosen.findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        pembimbingTa: true,
                        pembimbing2Ta: true,
                        dosenPa: true,
                        pengujiTa: true,
                        pembimbingPi: true,
                        pembimbingPlk: true,
                        penulisArtikel: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });

        // 2. Statistik ringkasan repository
        const [
            totalDosen,
            totalTugasAkhir,
            totalLaporanPi,
            totalLaporanPlk,
            totalArtikelJurnal,
            totalPengujiTa,
            sdgsRaw,
            prodiRaw,
        ] = await Promise.all([
            prisma.dosen.count(),
            prisma.tugasAkhir.count(),
            prisma.laporanPi.count(),
            prisma.laporanPLK.count(),
            prisma.artikelJurnal.count(),
            prisma.pengujiTugasAkhir.count(),
            prisma.sDGs.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    code: true,
                    title: true,
                    imageUrl: true,
                    _count: {
                        select: {
                            tugasAkhirs: true,
                            artikelJurnal: true,
                        },
                    },
                },
                orderBy: { code: "asc" },
            }),
            prisma.programStudy.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    degree: true,
                    _count: {
                        select: {
                            tugasAkhirs: true,
                            artikelJurnals: true,
                        },
                    },
                },
                orderBy: { name: "asc" },
            }),
        ]);

        // 3. Tren 5 Tahun Terakhir
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 4;

        const [tugasAkhirYears, artikelYears] = await Promise.all([
            prisma.tugasAkhir.groupBy({
                by: ["tahunMasuk"],
                where: { tahunMasuk: { gte: startYear } },
                _count: { id: true },
                orderBy: { tahunMasuk: "asc" },
            }),
            prisma.artikelJurnal.groupBy({
                by: ["tahun"],
                where: { tahun: { gte: startYear } },
                _count: { id: true },
                orderBy: { tahun: "asc" },
            }),
        ]);

        const trenTahunan = Array.from({ length: 5 }, (_, idx) => {
            const yr = startYear + idx;
            const taCount = tugasAkhirYears.find((t) => t.tahunMasuk === yr)?._count.id ?? 0;
            const artCount = artikelYears.find((a) => a.tahun === yr)?._count.id ?? 0;
            return {
                tahun: yr,
                tugasAkhir: taCount,
                artikel: artCount,
                total: taCount + artCount,
            };
        });

        // 4. Kalkulasi Data Science untuk Beban Dosen
        const baseDosenStats = dosens.map((d) => {
            const pUtama = d._count.pembimbingTa;
            const pPendamping = d._count.pembimbing2Ta;
            const totalTa = pUtama + pPendamping;
            const pa = d._count.dosenPa;
            const penguji = d._count.pengujiTa;
            const pi = d._count.pembimbingPi;
            const plk = d._count.pembimbingPlk;
            const artikel = d._count.penulisArtikel;
            const totalAktivitas = totalTa + penguji + pa + pi + plk + artikel;

            return {
                id: d.id,
                name: d.name,
                pembimbingUtama: pUtama,
                pembimbingPendamping: pPendamping,
                totalTa,
                totalBimbingan: totalTa,
                dosenPa: pa,
                penguji,
                pembimbingPi: pi,
                pembimbingPlk: plk,
                penulisArtikel: artikel,
                totalAktivitas,
            };
        });

        const totalBimbinganSemua = baseDosenStats.reduce((acc, d) => acc + d.totalTa, 0);
        const totalAktivitasSemua = baseDosenStats.reduce((acc, d) => acc + d.totalAktivitas, 0);
        const nDosen = dosens.length || 1;
        const meanBimbingan = Number((totalBimbinganSemua / nDosen).toFixed(1));
        const meanAktivitas = Number((totalAktivitasSemua / nDosen).toFixed(1));

        // Standard deviation bimbingan
        const variance = baseDosenStats.reduce((acc, d) => acc + Math.pow(d.totalTa - meanBimbingan, 2), 0) / nDosen;
        const stdDevBimbingan = Number(Math.sqrt(variance).toFixed(1));

        // Fairness index (persentase pemerataan beban)
        const cv = meanBimbingan > 0 ? stdDevBimbingan / meanBimbingan : 0;
        const fairnessIndex = Math.max(10, Math.min(100, Math.round((1 - Math.min(cv, 1) * 0.45) * 100)));

        // Tambahkan klasifikasi status beban
        const dosenList = baseDosenStats.map((d) => {
            let workloadStatus: "Kapasitas Tersedia" | "Beban Ideal" | "Beban Tinggi" = "Beban Ideal";
            if (d.totalTa > meanBimbingan + 0.6 * stdDevBimbingan && d.totalTa >= 4) {
                workloadStatus = "Beban Tinggi";
            } else if (d.totalTa < Math.max(1, meanBimbingan - 0.5 * stdDevBimbingan)) {
                workloadStatus = "Kapasitas Tersedia";
            }
            return {
                ...d,
                workloadStatus,
            };
        });

        // Histogram distribusi bimbingan
        const distribusiBeban = [
            { label: "0 Bimbingan", count: dosenList.filter((d) => d.totalTa === 0).length, tier: "Belum Ada" },
            { label: "1 - 3 Bimbingan", count: dosenList.filter((d) => d.totalTa >= 1 && d.totalTa <= 3).length, tier: "Ringan" },
            { label: "4 - 7 Bimbingan", count: dosenList.filter((d) => d.totalTa >= 4 && d.totalTa <= 7).length, tier: "Optimal" },
            { label: "8 - 12 Bimbingan", count: dosenList.filter((d) => d.totalTa >= 8 && d.totalTa <= 12).length, tier: "Padat" },
            { label: "13+ Bimbingan", count: dosenList.filter((d) => d.totalTa >= 13).length, tier: "Maksimal" },
        ];

        // Top Dosen
        const topDosen = [...dosenList]
            .sort((a, b) => b.totalTa - a.totalTa)
            .slice(0, 5);

        // SDGs distribution
        const sdgsList = sdgsRaw.map((s) => ({
            id: s.id,
            code: s.code,
            title: s.title,
            imageUrl: s.imageUrl,
            countTa: s._count.tugasAkhirs,
            countArtikel: s._count.artikelJurnal,
            total: s._count.tugasAkhirs + s._count.artikelJurnal,
        })).sort((a, b) => b.total - a.total);

        // Prodi distribution
        const prodiList = prodiRaw.map((p) => ({
            id: p.id,
            name: p.name,
            degree: p.degree,
            countTa: p._count.tugasAkhirs,
            countArtikel: p._count.artikelJurnals,
            total: p._count.tugasAkhirs + p._count.artikelJurnals,
        })).sort((a, b) => b.total - a.total);

        return NextResponse.json({
            summary: {
                totalDosen,
                totalTugasAkhir,
                totalLaporanPi,
                totalLaporanPlk,
                totalArtikelJurnal,
                totalPengujiTa,
                totalBimbinganSemua,
                totalAktivitasSemua,
                meanBimbingan,
                meanAktivitas,
                stdDevBimbingan,
                fairnessIndex,
                dosenAktifCount: dosenList.filter((d) => d.totalAktivitas > 0).length,
            },
            topDosen,
            dosenList,
            distribusiBeban,
            sdgsList,
            prodiList,
            trenTahunan,
        });
    } catch (error) {
        console.error("Dosen Dashboard API Error:", error);
        return NextResponse.json(
            { message: "Gagal mengambil data dashboard dosen" },
            { status: 500 }
        );
    }
}

