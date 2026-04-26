import { prisma } from "../../src/services/prisma.js";

const tables = [
  '"AuditLog"',
  '"RefreshToken"',
  '"Card"',
  '"Column"',
  '"Board"',
  '"User"',
].join(", ");

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}