"use client";

export default function DosenDaftarRedirect() {
    // Halaman daftar dosen sudah ada di /dosen (dashboard),
    // halaman ini bisa diisi konten tambahan atau sebagai alias
    if (typeof window !== "undefined") {
        window.location.href = "/dosen";
    }
    return null;
}
