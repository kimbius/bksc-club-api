const Fastify = require("fastify");
const FastifyCors = require("fastify-cors");
const FastifyHelmet = require("fastify-helmet");

require('dotenv').config();

const fastify = Fastify({ logger: process.env.NODE_ENV != 'production' });

fastify.register(FastifyCors, {
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE']
})
fastify.register(FastifyHelmet, { global: true })

fastify.get('/', async (request, reply) => {
    return { message: 'hello client!' }
})

fastify.register(require('./routes/Club'), { prefix: '/clubs' })

const start = async () => {
    try {
        await fastify.listen(process.env['SERVER_PORT'])
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()