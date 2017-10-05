const Hemera = require('nats-hemera')
const HemeraJoi = require('hemera-joi')
const nats = require('nats').connect('nats://eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaXNoIjpbIlNBTkRCT1guKiIsIj4iXSwic3Vic2NyaWJlIjpbIlBVQkxJQy4-IiwiX0lOQk9YLj4iLCI-Il0sImlhdCI6MTUwNzAyMjM0Mn0.oZG-RL3SGjtYL6sDXyE4vhgxfgZcvdd0fxmqCZurtotOugI3y6E0jdFk5-Uv_MIMW4CzmOILs0ZZXMXwkM7f8gnnp1VYl5Bb5mhMzMfmdFiqVZ6X_vYI93rwFei1u4WH6oybDXWQK7JJrv5dAaizGJS9pIo31Qf67T4XWdtEh5LGRKloOFQVCFvmG4ZHZsSAy42SqL42Mz8_ZwTk0SIt8N4u4xTMFaatqArQlaQhtIs79nnGv6gd3LJEgW1CeP3i3qq4uECWiLvnYaWaMYrqwgMnNTyTkt2SS0o5D24cr75irqxGZXjgglJRjzcXPpgr9z2TNYQuuEtcZ7d91wRTYw@192.168.1.151:4222/')
const asCallback = require('ascallback')

const hemera = new Hemera(nats, { logLevel: 'info' })
hemera.setOption('payloadValidator', 'hemera-joi')
hemera.use(HemeraJoi)

hemera.ready(() => {
  let Joi = hemera.joi

  const myPromise = (fail) => (
    new Promise((resolve, reject) => {
      if (fail) {
        return reject(new Error('boom'))
      }
      resolve(42)
    })
  )

  hemera.add({
    topic: 'test',
    cmd: 'boom',
    fail: Joi.boolean().required(),
  }, function ({fail}, cb) {
    return asCallback(myPromise(fail), cb)
  })

  hemera.add({
    topic: 'test',
    cmd: 'boom2',
    fail: Joi.boolean().required(),
  }, function ({fail}) {
    return myPromise(fail)
  })

  // const cmd = 'boom'
  const cmd = 'boom2'

  hemera
    .act({ topic: 'test', cmd, fail: true })
    .then(x => hemera.log.info(x))
    .catch(e => console.log(e.stack))
})
