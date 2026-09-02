import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    return await verifyToken(token);
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
export type SessionPayload = {
    userId: string;
    email: string;
    role: "ADMIN" | "MAHASISWA";
}


export async function createToken(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export async function verifyToken(token: string) {
    try{
        const { payload } = await jwtVerify(token, secret);
        return payload as SessionPayload;
    } catch (error) {
        return null;
    }
}

