import { PrismaClient } from '@prisma/client/extension';
import { FastifyInstance } from 'fastify';

declare module "fastify"{
    interface FastifyInstance {
        prisma: PrismaClient;
        config: {
            DATABASE_URL: string;
        }
    }
}