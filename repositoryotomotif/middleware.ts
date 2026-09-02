import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const ADMIN_PREFIX = "/admin";
const MAHASISWA_PREFIX = "/mahasiswa";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
    const isMahasiswaRoute = pathname.startsWith(MAHASISWA_PREFIX);

    if (!isAdminRoute && !isMahasiswaRoute) {
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
        return NextResponse.redirect(new URL("/mahasiswa", request.url));
    }

    if (isMahasiswaRoute && session.role !== "MAHASISWA") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/mahasiswa/:path*"],
};