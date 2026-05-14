import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import env from "@fastify/env";
import path from "node:path";

async function envPlugin(app: FastifyInstance){
    await app.register(env, {
        schema: {
            type: "object",
            required: ["DATABASE_URL"],

            properties: {
                DATABASE_URL: {
                    type: "string",
                },
            },
        },
        dotenv: {
            path: path.resolve(process.cwd(), "../.env"),
        },
    });
};

export default fp(envPlugin);