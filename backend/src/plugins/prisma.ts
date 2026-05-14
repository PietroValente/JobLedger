import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function prismaPlugin(app: FastifyInstance){
    const adapter = new PrismaPg({
        connectionString: app.config.DATABASE_URL,
    });

    const prisma = new PrismaClient({
        adapter,
    });

    app.decorate("prisma", prisma);

    app.addHook("onClose", async () => {
        await prisma.$disconnect();
    });
}

export default fp(prismaPlugin);