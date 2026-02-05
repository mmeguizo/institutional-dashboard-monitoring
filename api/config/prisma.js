/**
 * Prisma Client Service
 * Centralized database client with connection pooling for MySQL
 * 
 * Usage:
 *   const prisma = require('./config/prisma');
 *   const users = await prisma.user.findMany();
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

// Global singleton to prevent multiple instances in development
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
        ? ['info', 'warn', 'error'] 
        : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/idm',
        },
    },
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

module.exports = prisma;
