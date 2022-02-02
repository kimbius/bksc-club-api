const { getclubs, getstudent, joinclub, getclub } = require('../framework/bksc')
module.exports = (fastify, opts, done) => {
    fastify.get('/', async (request, reply) => {
        reply.send(await getclubs())
    })
    fastify.get('/getstudent', {
        schema: {
            querystring: {
                type: 'object',
                required: ['student_id'],
                properties: {
                    student_id: {
                        type: 'number'
                    }
                }
            }
        }
    }, async (request, reply) => {
        const student = await getstudent(request.query.student_id)
        if(!student.name) return reply.code(404).send(new Error("student is not exist"))
        reply.send(student)
    })
    fastify.post('/:club_id/join', {
        schema: {
            body: {
                type: 'object',
                required: ['student_id'],
                properties: {
                    student_id: {
                        type: 'number'
                    }
                }
            },
        }
    }, async (request, reply) => {
        reply.send(await joinclub(request.params.club_id, request.body.student_id))
    })
    fastify.get('/:club_id/info', async (request, reply) => {
        reply.send(await getclub(request.params.club_id))
    })
    done()
}