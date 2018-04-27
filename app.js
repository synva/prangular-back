import express from 'express'
import expressSession from 'express-session'
import path from 'path'
import bodyParser from 'body-parser'
import fs from 'fs'
import conf from 'config'
import http from 'http'
import cluster from 'cluster'
import os from 'os'
import logger from './services/logger.js'
import mongo from './services/mongo.js'
import compression from 'compression'
import passport from 'passport'
import flash from 'connect-flash'
import knox from 'knox'
import userHome from 'user-home'
import privateHttpRouter from './routers/privateHttpRouter.js'
import publicHttpRouter from './routers/publicHttpRouter.js'
import socketRouter from './routers/socketRouter.js'
import userService from './services/userService.js'

logger.info('NODE_ENV:', process.env.NODE_ENV)
logger.info('session mode:', conf.session.mode)
logger.info('authentication mode:', conf.authentication.mode)
logger.info('storagy mode:', conf.storagy.mode)

let isError = false

if (process.env.NODE_ENV === 'development') {
  startupExpress()
} else {
  if (cluster.isMaster) {
    let confInstance = 1
    if (conf.cluster) confInstance = conf.cluster.instances
    let numCPUs = os.cpus().length
    if (confInstance > numCPUs) confInstance = numCPUs

    for (let i = 0; i < confInstance; i++) {
      // Create a worker
      cluster.fork()
    }
  } else {
    startupExpress()
  }
}

function startupExpress () {
  let app = express()
  // app.set('views', path.join(__dirname, 'dist'))
  app.use(
    compression({
      filter: (req, res) => {
        const contentType = res.get('Content-Type')
        if (contentType && contentType.indexOf('application/json') === -1) {
          return false
        }
        return compression.filter(req, res)
      }
    })
  )
  app.use(bodyParser.json({limit: '2gb'}))
  app.use(bodyParser.urlencoded({limit: '2gb', extended: true}))




  let allowCrossDomain = (req, res, next) => {
    let origin = null
    if (req.headers.origin) origin = conf.cors.indexOf(req.headers.origin.toLowerCase()) > -1 ? req.headers.origin : null
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin)
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
      res.header('Access-Control-Allow-Credentials', true)
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    }

    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
      res.sendStatus(200)
    } else {
      next()
    }
  }
  app.all('*', allowCrossDomain)





  let expressRedisStore = require('connect-redis')(expressSession)
  let expressMongoStore = require('connect-mongo')(expressSession)

  let store = null
  let session = null
  if (conf.session.mode === 'mongo') {
    store = new expressMongoStore({
      url: 'mongodb://' + conf.mongo.user + ':' + conf.mongo.password + '@' + conf.mongo.server + ':' + conf.mongo.port + '/' + conf.mongo.db,
      clear_interval: 60 * 60
    })
    session = expressSession({
      store: store,
      cookie: {
        path: conf.session.path,
        httpOnly: false,
        maxAge: conf.session.cookieMaxAge
      },
      key: conf.session.key,
      secret: conf.session.secret,
      resave: false,
      saveUninitialized: false
    })
  } else {
    store = new expressRedisStore({
      host: conf.session.redisHost,
      port: conf.session.redisPort,
      db: conf.session.redisdb
    })
    session = expressSession({
      store: store,
      cookie: {
        path: conf.session.path,
        httpOnly: false,
        maxAge: conf.session.cookieMaxAge
      },
      key: conf.session.key,
      secret: conf.session.secret,
      resave: false,
      saveUninitialized: false
    })
  }
  app.use(session)
  privateHttpRouter.use(session)





  let LocalStrategy = require('passport-local').Strategy
  let strategy = null
  if (conf.authentication.mode === 'basic') {
    strategy = new LocalStrategy(
      (username, password, next) => {
        userService.authenticate(username, password, (error, user) => {
          if (error) {
            next(error, null)
          } else {
            next(null, user)
          }
        })
      }
    )
  }
  passport.use(strategy)
  passport.serializeUser((user, done) => {
    done(null, user)
  })
  passport.deserializeUser((user, done) => {
    done(null, user)
  })
  app.use(flash())
  app.use(passport.initialize())
  app.use(passport.session())




  if (conf.authentication.mode === 'basic') {
    app.post('/authenticate',
      passport.authenticate('local'),
      (req, res) => {
        // authenticate failed will not comes here. so here is only normal case and system error.
        if (req.session && req.session.passport && req.session.passport.user && req.session.passport.user._id) {
          logger.debug('auth success:', JSON.stringify(req.session.passport.user._id))
          userService.recordLogin(req.session.passport.user, (error, user) => {
            if (error) {
              res.json({error: error, data: null})
            } else {
              res.json({error: null, data: {user: user}})
            }
          })
        } else {
          res.json({error: {code: 'S002'}, data: null})
        }
      }
    )
  }




  let checkAuth = (req, res, next) => {
    if (req.session && req.session.passport && req.session.passport.user) {
      logger.debug('http session:', req.session.passport.user._id)
      next()
    } else {
      logger.error('miss session.')
      res.json({error: {code: 'B002'}, data: null})
    }
  }
  app.use('/private', checkAuth, privateHttpRouter)
  app.use('/public', publicHttpRouter)




  // let inspect = require('eyespect').inspector()
  let key = null
  let secret = null
  let text = fs.readFileSync(path.join(userHome, '.aws', 'credentials'), 'utf-8')
  let texts = text ? text.split(/\r\n|\r|\n/) : []
  texts.forEach(one => {
    if (one.indexOf('aws_access_key_id = ') === 0) key = one.split('aws_access_key_id = ')[1]
    if (one.indexOf('aws_secret_access_key = ') === 0) secret = one.split('aws_secret_access_key = ')[1]
  })
  if (key && secret) {
    app.get('/static/*', (req, res) => {
      let url = decodeURI(req.url)
      if (url.indexOf('/static/s3') === 0) {
        let client = knox.createClient({
          key: key,
          secret: secret,
          bucket: conf.storagy.bucket,
          region: conf.storagy.region
        })
        let s3path = url.substring(11, url.length)
        client.getFile(s3path, (error, s3res) => {
          if (error) {
            logger.error(error)
            res.send(404, 'Not found')
            return
          }
          s3res.pipe(res)
          s3res.on('error', (s3err) => {
            logger.error(JSON.stringify(s3err))
            res.send(404, 'Not found')
            // inspect(s3err, '')
          })
          // s3res.on('progress', (data) => {
          //   inspect(data, '')
          // })
          // s3res.on('end', () => {
          //   inspect(s3path, '')
          // })
        })
      } else if (url.indexOf('/static/upload') === 0) {
        url = url.replace('/static/', '/')
        res.sendFile(path.join(__dirname, url))
      } else {
        res.sendFile(path.join(__dirname, 'dist', url))
      }
    })
  } else {
    isError = true
    logger.error('invalid aws configure!')
  }




  app.get('/login', (req, res) => {
    logger.info('login')
    if (!req.session || !req.session.passport || !req.session.passport.user) {
      logger.info('need authenticate')
      res.json({error: null, data: {user: null}})
    } else {
      logger.info('login success:', JSON.stringify(req.session.passport.user._id))
      userService.recordLogin(req.session.passport.user, (error, user) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {user: user}})
        }
      })
    }
  })
  app.post('/register', (req, res) => {
    logger.info('register:', JSON.stringify(req.body))
    userService.insertUser(req.body, (error, user) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {user: user}})
      }
    })
  })
  app.get('/logout', (req, res) => {
    logger.info('logout')
    if (req.session && req.session.passport && req.session.passport.user) {
      logger.info('user:', req.session.passport.user._id)
    }
    // if (req.session) {
    //   req.session.destroy((error) => {
    //     logger.debug('logouted:', error)
    //   })
    // }
    req.logout()
    res.json({error: null, data: {}})
  })




  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })




  let server = http.createServer(app)
  let onListening = () => {
    let addr = server.address()
    let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port
    logger.info('Listening on', bind)
  }
  mongo.init((error) => {
    if (!error && !isError) {
      server.listen(conf.port)
      server.on('listening', onListening)
      socketRouter.init(server, session)
    }
  })

}
