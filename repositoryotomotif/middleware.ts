import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const ADMIN_PREFIX = "/admin";
const MAHASISWA_PREFIX = "/mahasiswa";
const DOSEN_PREFIX = "/dosen";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
    const isMahasiswaRoute = pathname.startsWith(MAHASISWA_PREFIX);
    const isDosenRoute = pathname.startsWith(DOSEN_PREFIX);

    if (!isAdminRoute && !isMahasiswaRoute && !isDosenRoute) {
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value;

    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const session = await verifyToken(token);

    if (!session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("token");
        return response;
    }

    if (isAdminRoute && session.role !== "ADMIN") {
        if (session.role === "DOSEN") return NextResponse.redirect(new URL("/dosen", request.url));
        return NextResponse.redirect(new URL("/mahasiswa", request.url));
    }

    if (isMahasiswaRoute && session.role !== "MAHASISWA") {
        if (session.role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
        return NextResponse.redirect(new URL("/dosen", request.url));
    }

    if (isDosenRoute && session.role !== "DOSEN") {
        if (session.role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
        return NextResponse.redirect(new URL("/mahasiswa", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/mahasiswa/:path*", "/dosen/:path*"],
};