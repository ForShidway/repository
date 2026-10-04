import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ExportType = "tugas-akhir" | "artikel-jurnal" | "laporan-pi" | "laporan-plk" | "laporan-kp";
type ExportRow = Record<string, string>;

type Column = {
    label: string;
    key: string;
};

const EXPORTS: Record<ExportType, { filename: string; sheetName: string; title: string; columns: Column[] }> = {
    "tugas-akhir": {
        filename: "data-tugas-akhir.xls",
        sheetName: "Tugas Akhir",
        title: "Daftar Tugas Akhir Mahasiswa",
        columns: [
            { label: "No", key: "no" },
            { label: "Nama Mahasiswa", key: "mahasiswa" },
            { label: "NIM", key: "nim" },
            { label: "Judul", key: "judul" },
            { label: "Jenis Pendidikan", key: "jenisPendidikan" },
            { label: "Tahun Masuk", key: "tahunMasuk" },
            { label: "Program Studi", key: "programStudy" },
            { label: "Pembimbing 1", key: "pembimbing1" },
            { label: "Pembimbing 2", key: "pembimbing2" },
            { label: "Dosen PA", key: "dosenPa" },
            { label: "Nama File", key: "fileName" },
            { label: "Link File", key: "filePath" },
        ],
    },
    "artikel-jurnal": {
        filename: "data-artikel-jurnal.xls",
        sheetName: "Artikel Jurnal",
        title: "Daftar Artikel Jurnal Mahasiswa",
        columns: [
            { label: "No", key: "no" },
            { label: "Nama Penulis", key: "penulis" },
            { label: "NIM", key: "nim" },
            { label: "Judul", key: "judul" },
            { label: "Tahun", key: "tahun" },
            { label: "Program Studi", key: "programStudy" },
            { label: "Nama File", key: "fileName" },
            { label: "Link File", key: "filePath" },
        ],
    },
    "laporan-pi": {
        filename: "data-laporan-pi.xls",
        sheetName: "Laporan PI",
        title: "Daftar Laporan LPI Mahasiswa",
        columns: [
            { label: "No", key: "no" },
            { label: "Nama Mahasiswa", key: "name" },
            { label: "NIM", key: "nim" },
            { label: "Judul", key: "judul" },
            { label: "Nama Instansi", key: "namaInstansi" },
            { label: "Alamat", key: "alamat" },
            { label: "Dosen Pembimbing", key: "dosenPembimbing" },
            { label: "Tanggal Mulai", key: "tanggalMulai" },
            { label: "Tanggal Selesai", key: "tanggalSelesai" },
            { label: "Nama File", key: "fileName" },
            { label: "Link File", key: "filePath" },
        ],
    },
    "laporan-plk": {
        filename: "data-laporan-plk.xls",
        sheetName: "Laporan PLK",
        title: "Daftar Laporan PLK Mahasiswa",
        columns: [
            { label: "No", key: "no" },
            { label: "Nama Mahasiswa", key: "name" },
            { label: "NIM", key: "nim" },
            { label: "Judul", key: "judul" },
            { label: "Nama Instansi", key: "namaInstansi" },
            { label: "Alamat", key: "alamat" },
            { label: "Dosen Pembimbing", key: "dosenPembimbing" },
            { label: "Tanggal Mulai", key: "tanggalMulai" },
            { label: "Tanggal Selesai", key: "tanggalSelesai" },
            { label: "Nama File", key: "fileName" },
            { label: "Link File", key: "filePath" },
        ],
    },
    "laporan-kp": {
        filename: "data-laporan-kp.xls",
        sheetName: "Laporan KP",
        title: "Daftar Laporan Kerja Praktek Mahasiswa",
        columns: [
            { label: "No", key: "no" },
            { label: "Nama Mahasiswa", key: "name" },
            { label: "NIM", key: "nim" },
            { label: "Judul", key: "judul" },
            { label: "Nama Instansi", key: "namaInstansi" },
            { label: "Alamat", key: "alamat" },
            { label: "Dosen Pembimbing", key: "dosenPembimbing" },
            { label: "Tanggal Mulai", key: "tanggalMulai" },
            { label: "Tanggal Selesai", key: "tanggalSelesai" },
            { label: "Nama File", key: "fileName" },
            { label: "Link File", key: "filePath" },
        ],
    },
};

function text(value: unknown): string {
    return value === null || value === undefined || value === "" ? "-" : String(value);
}

function formatDate(value: Date): string {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(value);
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function fileLink(value: string | null | undefined, baseUrl: string): string {
    if (!value) return "";
    try {
        return new URL(value, baseUrl).toString();
    } catch {
        return value;
    }
}

function renderWorkbook(config: (typeof EXPORTS)[ExportType], rows: ExportRow[]): string {
    const headers = config.columns
        .map((column) => `<th>${escapeHtml(column.label)}</th>`)
        .join("");
    const body = rows
        .map((row) => {
            const cells = config.columns.map((column) => {
                const value = row[column.key] ?? "-";
                if (column.key === "filePath" && value !== "-") {
                    return `<td><a href="${escapeHtml(value)}">${escapeHtml(value)}</a></td>`;
                }
                return `<td>${escapeHtml(value)}</td>`;
            }).join("");
            return `<tr>${cells}</tr>`;
        })
        .join("");

    return `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #1f2937; }
                    .report-title { color: #0f172a; font-size: 24px; font-weight: bold; text-align: center; padding: 8px 8px; }
                    .report-spacer { height: 16px; line-height: 16px; }
                    table { border-collapse: collapse; width: 100%; }
                    thead th { background: #1d4ed8; color: #fff; font-weight: bold; text-align: left; padding: 22px 12px; border: 1px solid #1e40af; vertical-align: middle;  }
                    tbody td { border: 1px solid #2a3849; padding: 8px; vertical-align: top; }
                    tbody tr:nth-child(even) { background: #eff6ff; }
                    a { color: #1d4ed8; text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="report-title">${escapeHtml(config.title)}</div>
                <div class="report-spacer">&nbsp;</div>
                <table data-sheet-name="${escapeHtml(config.sheetName)}">
                    <thead>
                        <tr style="height: 45px">${headers}</tr>
                    </thead>
                    <tbody>
                        ${body}
                    </tbody>
                </table>
            </body>
        </html>`;
    }

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ message: "Akses ditolak. Hanya Admin yang dapat mengunduh data." }, { status: 403 });
    }

    const type = new URL(request.url).searchParams.get("type") as ExportType | null;
    if (!type || !EXPORTS[type]) {
        return NextResponse.json({ message: "Jenis ekspor tidak valid." }, { status: 400 });
    }

    const baseUrl = new URL(request.url).origin;
    let rows: ExportRow[];

    if (type === "tugas-akhir") {
        const items = await prisma.tugasAkhir.findMany({
            orderBy: { createdAt: "desc" },
            include: { mahasiswa: { orderBy: { urutan: "asc" } }, pembimbing: true, pembimbing2: true, dosenPa: true, programStudy: true },
        });
        rows = items.map((item, index) => ({
            no: String(index + 1), mahasiswa: item.mahasiswa.map((value) => value.name).join(", "), nim: item.mahasiswa.map((value) => value.nim).join(", "),
            judul: item.judul, jenisPendidikan: item.jenisPendidikan === "NON_PENDIDIKAN" ? "Non Pendidikan" : "Pendidikan", tahunMasuk: String(item.tahunMasuk),
            programStudy: item.programStudy ? `${item.programStudy.degree} ${item.programStudy.name}` : "-", pembimbing1: item.pembimbing.name, pembimbing2: text(item.pembimbing2?.name), dosenPa: text(item.dosenPa?.name),  fileName: text(item.fileName) ,filePath: fileLink(item.filePath, baseUrl),
        }));
    } else if (type === "artikel-jurnal") {
        const items = await prisma.artikelJurnal.findMany({
            orderBy: { createdAt: "desc" },
            include: { penulis: { orderBy: { urutan: "asc" } }, programStudy: true },
        });
        rows = items.map((item, index) => ({
            no: String(index + 1), penulis: item.penulis.map((value) => value.nama).join(", "), nim: item.penulis.filter((value) => value.nim).map((value) => value.nim as string).join(", "), judul: item.judul, tahun: String(item.tahun),
            programStudy: item.programStudy ? `${item.programStudy.degree} ${item.programStudy.name}` : "-", fileName: text(item.fileName), filePath: fileLink(item.filePath, baseUrl),
        }));
    } else if (type === "laporan-pi") {
        const items = await prisma.laporanPi.findMany({ orderBy: { createdAt: "desc" }, include: { dosenPembimbing: true } });
        rows = items.map((item, index) => ({
            no: String(index + 1), name: item.name, nim: item.nim, judul: item.judul, namaInstansi: item.namaInstansi, alamat: item.alamat,
            dosenPembimbing: item.dosenPembimbing.name, tanggalMulai: formatDate(item.tanggalMulai), tanggalSelesai: formatDate(item.tanggalSelesai), fileName: text(item.fileName), filePath: fileLink(item.filePath, baseUrl),
        }));
    } else if (type === "laporan-plk") {
        const items = await prisma.laporanPLK.findMany({ orderBy: { createdAt: "desc" }, include: { dosenPembimbing: true } });
        rows = items.map((item, index) => ({
            no: String(index + 1), name: item.name, nim: item.nim, judul: item.judul, namaInstansi: item.namaInstansi, alamat: item.alamat,
            dosenPembimbing: item.dosenPembimbing.name, tanggalMulai: formatDate(item.tanggalMulai), tanggalSelesai: formatDate(item.tanggalSelesai), fileName: text(item.fileName), filePath: fileLink(item.filePath, baseUrl),
        }));
    } else {
        const items = await prisma.laporanKerjaPraktek.findMany({ orderBy: { createdAt: "desc" }, include: { dosenPembimbing: true } });
        rows = items.map((item, index) => ({
            no: String(index + 1), name: item.name, nim: item.nim, judul: item.judul, namaInstansi: item.namaInstansi, alamat: item.alamat,
            dosenPembimbing: item.dosenPembimbing.name, tanggalMulai: formatDate(item.tanggalMulai), tanggalSelesai: formatDate(item.tanggalSelesai), fileName: text(item.fileName), filePath: fileLink(item.filePath, baseUrl),
        }));
    }

    const workbook = renderWorkbook(EXPORTS[type], rows);
    return new NextResponse(`\ufeff${workbook}`, {
        headers: {
            "Content-Type": "application/vnd.ms-excel; charset=utf-8",
            "Content-Disposition": `attachment; filename="${EXPORTS[type].filename}"`,
            "Cache-Control": "no-store",
        },
    });
}
