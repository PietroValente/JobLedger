import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { healthRoutes } from "./modules/health/health.routes.js";
import prismaPlugin from "./plugins/prisma.js";
import envPlugin from "./plugins/env.js";

export async function buildApp(){
    const app = Fastify({
        logger: {
            transport: {
                target: "pino-pretty",
                options: {
                    translateTime: "HH:MM:ss Z",
                    ignore: "pid,hostname",
                    colorize: true,
                },
            },
        },
    });
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(envPlugin);
    await app.register(prismaPlugin);
    await app.register(healthRoutes);

    return app;
}