import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port),
  user: databaseUrl.username,
  password: databaseUrl.password,
  database: databaseUrl.pathname.slice(1),
});

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
}

export const prisma =  globalForPrisma.prisma ?? new PrismaClient({ adapter, });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}