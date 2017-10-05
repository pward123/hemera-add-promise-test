const Hemera = require('nats-hemera')
const HemeraJoi = require('hemera-joi')
const nats = require('nats').connect('')
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
