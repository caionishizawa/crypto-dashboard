import { PrismaClient } from '@prisma/client';

// Singleton para garantir uma única instância do Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Função para desconectar o Prisma Client
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
}; 