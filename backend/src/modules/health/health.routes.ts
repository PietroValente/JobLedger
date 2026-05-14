import { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
    app.get("/ping", async ()=> {
        return {message: "pong"};
    })

    app.get("/health", async (request, reply)=> {
        try{
            await app.prisma.$queryRaw`SELECT 1`;

            return reply.status(200).send({
                status: "ok",
                services: {
                    db: "ok"
                }
            })
        } catch (e) {
            request.log.error(e);

            return reply.status(503).send({
                status: "error",
                db: "down"
            })
        }
    })
}