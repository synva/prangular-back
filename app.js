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
import homepageService from './services/homepageService.js'
import sellPieceService from './services/sellPieceService.js'
import rentPieceService from './services/rentPieceService.js'
import topicService from './services/topicService.js'

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




  let commonResponseHeader = (req, res, next) => {
    res.header('X-XSS-Protection', '1; mode=block')
    res.header('X-Frame-Options', 'DENY')
    res.header('X-Content-Type-Options', 'nosniff')
    next()
  }
  app.all('/*', commonResponseHeader)




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
    Promise.all([
      new Promise((resolve, reject) => {
        userService.insertUser(req.body.user, (error, user) => {
          if (error) {
            return reject(error)
          } else {
            resolve(user)
          }
        })
      }),
      new Promise((resolve, reject) => {
        homepageService.insertHomepage(req.body.user, req.body.homepage, (error, homepage) => {
          if (error) {
            return reject(error)
          } else {
            resolve(homepage)
          }
        })
      }),
      new Promise((resolve, reject) => {
        let sellPieces = [{
          isPublishing: true,
          tags: [],
          contactID: req.body.user._id,
          name: 'サンプル売買物件1',
          address: '東京都江東区亀戸',
          price: 55000000,
          aspect: '1',
          layout: '2DK',
          story: 20,
          floor: 10,
          exclusiveArea: 55.56,
          buildingArea: null,
          landArea: null,
          type: '1',
          structure: '2',
          built: 1493564400000.0,
          isNew: null,
          direction: '6',
          households: 137,
          manage: 15000,
          repair: 5000,
          margin: '3％+6ｗ',
          available: '1',
          residentable: 1527001200000.0,
          rights: '1',
          coverage: null,
          volume: null,
          connection: null,
          carParking: null,
          bikeParking: null,
          balcony: null,
          pet: null,
          cityGas: 'on',
          stations: [{
            station: 'JR中央・総武線-亀戸駅',
            walking: 12
          }],
          remark: '価格は相談可能です。',
          latitude: 35.6995366,
          longitude: 139.82657270000004,
          photos: [
            '/static/s3/upload/sample/sellPiece/photos/b8ff537c-d4ee-4011-bee3-5da8eae2409c/18.jpg'
          ],
          photoThumbnails: [
            '/static/s3/upload/sample/sellPiece/photos/b8ff537c-d4ee-4011-bee3-5da8eae2409c/18.jpg'
          ],
          floorPlans: [
            '/static/s3/upload/sample/sellPiece/floorPlans/f155190d-7797-4ba7-9a53-093d1622c174/3.jpg'
          ],
          floorPlanThumbnails: [
            '/static/s3/upload/sample/sellPiece/floorPlans/f155190d-7797-4ba7-9a53-093d1622c174/3.jpg'
          ],
          previews: [
            '/static/s3/upload/sample/sellPiece/previews/4dc3e96c-1cc7-4c49-a83d-49f2b8612711/A05.jpg'
          ],
          previewThumbnails: [
            '/static/s3/upload/sample/sellPiece/previews/4dc3e96c-1cc7-4c49-a83d-49f2b8612711/A05.jpg'
          ]
        }, {
          isPublishing: true,
          tags: [],
          contactID: req.body.user._id,
          name: 'サンプル売買物件2',
          address: '東京都渋谷区3丁目',
          price: 150000000,
          aspect: null,
          layout: '3LDK',
          story: 50,
          floor: 10,
          exclusiveArea: 108,
          buildingArea: null,
          landArea: null,
          type: '1',
          structure: '2',
          built: 1522508400000.0,
          isNew: 'on',
          direction: '2',
          households: 200,
          manage: 2500,
          repair: 50000,
          margin: null,
          available: '1',
          residentable: 1527692400000.0,
          rights: '1',
          coverage: null,
          volume: null,
          connection: null,
          carParking: 'on',
          bikeParking: 'on',
          balcony: 'on',
          pet: 'on',
          cityGas: 'on',
          stations: [
            {
              station: 'JR山手線-渋谷駅',
              walking: 5
            }
          ],
          remark: null,
          latitude: 35.6617773,
          longitude: 139.70405059999996,
          photos: [
            '/static/s3/upload/sample/sellPiece/photos/90d34ebb-07e1-4b11-974c-83b8ff8b243a/indoors-3058658_1920.jpg'
          ],
          photoThumbnails: [
            '/static/s3/upload/sample/sellPiece/photos/90d34ebb-07e1-4b11-974c-83b8ff8b243a/indoors-3058658_1920.jpg'
          ],
          floorPlans: [
            '/static/s3/upload/sample/sellPiece/floorPlans/96f7bac6-cabc-4175-a8c5-a1912550193c/3.jpg'
          ],
          floorPlanThumbnails: [
            '/static/s3/upload/sample/sellPiece/floorPlans/96f7bac6-cabc-4175-a8c5-a1912550193c/3.jpg'
          ],
          previews: [
            '/static/s3/upload/sample/sellPiece/previews/1ae2665c-cb04-4553-b10c-3acb2b7c31d6/A06.jpg'
          ],
          previewThumbnails: [
            '/static/s3/upload/sample/sellPiece/previews/1ae2665c-cb04-4553-b10c-3acb2b7c31d6/A06.jpg'
          ]
        }, {
          isPublishing: true,
          tags: [],
          contactID: req.body.user._id,
          name: 'サンプル売買物件3',
          address: '亀戸二丁目',
          price: 13000000,
          aspect: null,
          layout: '1DK',
          story: 12,
          floor: 3,
          exclusiveArea: 45,
          buildingArea: null,
          landArea: null,
          type: '1',
          structure: '2',
          built: 1430406000000.0,
          isNew: null,
          direction: '2',
          households: 20,
          manage: 15000,
          repair: null,
          margin: null,
          available: '2',
          residentable: 1525359600000.0,
          rights: '2',
          coverage: null,
          volume: null,
          connection: null,
          carParking: null,
          bikeParking: null,
          balcony: null,
          pet: null,
          cityGas: null,
          stations: [
            {
              station: 'JR山手線-巣鴨駅',
              walking: 14
            }
          ],
          remark: null,
          latitude: 35.7030711,
          longitude: 139.82064839999998,
          photos: [
            '/static/s3/upload/sample/sellPiece/photos/798dbd55-889f-4e71-ab7a-9bc8b8786162/royal-interior-1455805_1920.jpg'
          ],
          photoThumbnails: [
            '/static/s3/upload/sample/sellPiece/photos/798dbd55-889f-4e71-ab7a-9bc8b8786162/royal-interior-1455805_1920.jpg'
          ],
          floorPlans: [
            '/static/s3/upload/sample/sellPiece/floorPlans/88a93098-c719-45fb-84d6-7f831c531a02/3.jpg'
          ],
          floorPlanThumbnails: [
            '/static/s3/upload/sample/sellPiece/floorPlans/88a93098-c719-45fb-84d6-7f831c531a02/3.jpg'
          ],
          previews: [
            '/static/s3/upload/sample/sellPiece/previews/9db43759-02c0-4938-88fb-dd29be5ea7bf/A07.jpg'
          ],
          previewThumbnails: [
            '/static/s3/upload/sample/sellPiece/previews/9db43759-02c0-4938-88fb-dd29be5ea7bf/A07.jpg'
          ]
        }]
        sellPieceService.insertSellPieces(req.body.user, sellPieces, (error, inserted) => {
          if (error) {
            return reject(error)
          } else {
            resolve(inserted)
          }
        })
      }),
      new Promise((resolve, reject) => {
        let rentPieces = [{
          isPublishing: true,
          tags: [],
          contactID: req.body.user._id,
          name: 'サンプル賃貸物件1',
          address: '品川区東品川',
          rent: 95000,
          deposit: 2,
          keyMoney: 1,
          updateMoney: 1,
          insurance: '火災保険付き',
          contractPeroid: '２年',
          aspect: '1',
          layout: '1DK',
          story: 16,
          floor: 6,
          exclusiveArea: 19.8,
          type: '1',
          structure: '2',
          built: null,
          isNew: 'on',
          direction: '3',
          manage: null,
          margin: '相談',
          available: '3',
          residentable: 1526569200000.0,
          carParking: 'on',
          bikeParking: 'on',
          balcony: 'on',
          pet: 'on',
          cityGas: 'on',
          stations: [
            {
              station: 'JR埼京線-大崎駅',
              walking: 10
            }
          ],
          remark: null,
          latitude: 35.6092261,
          longitude: 139.73018609999997,
          photos: [
            '/static/s3/upload/sample/rentPiece/photos/df95b83c-80a6-4016-820a-43b713d141b8/18.jpg'
          ],
          photoThumbnails: [
            '/static/s3/upload/sample/rentPiece/photos/df95b83c-80a6-4016-820a-43b713d141b8/18.jpg'
          ],
          floorPlans: [
            '/static/s3/upload/sample/rentPiece/floorPlans/9d94fb98-6205-49db-aa45-596531799cbe/3.jpg'
          ],
          floorPlanThumbnails: [
            '/static/s3/upload/sample/rentPiece/floorPlans/9d94fb98-6205-49db-aa45-596531799cbe/3.jpg'
          ],
          previews: [
            '/static/s3/upload/sample/rentPiece/previews/36f03e09-a2d8-4d93-beb8-f7fdecc8989d/A05.jpg'
          ],
          previewThumbnails: [
            '/static/s3/upload/sample/rentPiece/previews/36f03e09-a2d8-4d93-beb8-f7fdecc8989d/A05.jpg'
          ]
        }, {
          isPublishing: true,
          tags: [],
          contactID: req.body.user._id,
          name: 'サンプル賃貸物件2',
          address: '江東区',
          rent: 65000,
          deposit: 1,
          keyMoney: null,
          updateMoney: 1,
          insurance: null,
          contractPeroid: null,
          aspect: null,
          layout: '1LDK',
          story: null,
          floor: null,
          exclusiveArea: 50.5,
          type: '3',
          structure: '2',
          built: null,
          isNew: null,
          direction: '1',
          manage: null,
          margin: null,
          available: null,
          residentable: null,
          carParking: null,
          bikeParking: 'on',
          balcony: null,
          pet: null,
          cityGas: 'on',
          stations: [{
            station: 'JR山手線-秋葉原駅',
            walking: 10
          }],
          remark: null,
          latitude: 35.69413469999999,
          longitude: 139.8117893,
          photos: [
            '/static/s3/upload/sample/rentPiece/photos/db4c1e62-6670-4bef-9c87-289e25a91128/353137159459086576.jpg'
          ],
          photoThumbnails: [
            '/static/s3/upload/sample/rentPiece/photos/db4c1e62-6670-4bef-9c87-289e25a91128/353137159459086576.jpg'
          ],
          floorPlans: [
            '/static/s3/upload/sample/rentPiece/floorPlans/11125dd3-17b1-42c7-93f0-3ea52264074a/3.jpg'
          ],
          floorPlanThumbnails: [
            '/static/s3/upload/sample/rentPiece/floorPlans/11125dd3-17b1-42c7-93f0-3ea52264074a/3.jpg'
          ],
          previews: [
            '/static/s3/upload/sample/rentPiece/previews/d90035c0-fe3c-4c41-9e18-e6121cb89681/A05.jpg'
          ],
          previewThumbnails: [
            '/static/s3/upload/sample/rentPiece/previews/d90035c0-fe3c-4c41-9e18-e6121cb89681/A05.jpg'
          ]
        }, {
          isPublishing: true,
          tags: [],
          contactID: req.body.user._id,
          name: 'サンプル賃貸物件3',
          address: '江戸川区',
          rent: 80000,
          deposit: 1,
          keyMoney: 1,
          updateMoney: 1,
          insurance: null,
          contractPeroid: null,
          aspect: null,
          layout: '2LDK',
          story: null,
          floor: 3,
          exclusiveArea: 60.55,
          type: '3',
          structure: '2',
          built: null,
          isNew: null,
          direction: '2',
          manage: null,
          margin: null,
          available: null,
          residentable: null,
          carParking: 'on',
          bikeParking: null,
          balcony: null,
          pet: null,
          cityGas: 'on',
          stations: [{
            station: 'JR中央・総武線-小岩駅',
            walking: 3
          }],
          remark: null,
          latitude: 35.715761,
          longitude: 139.85920220000003,
          photos: [
            '/static/s3/upload/sample/rentPiece/photos/ed1cd8c0-6ae8-499c-a738-adc9edaf76aa/render-1477041_1280.jpg',
            '/static/s3/upload/sample/rentPiece/photos/9d8fbb75-4731-4c10-8150-9cdbcb8c5f00/459664995914653481.jpg'
          ],
          photoThumbnails: [
            '/static/s3/upload/sample/rentPiece/photos/ed1cd8c0-6ae8-499c-a738-adc9edaf76aa/render-1477041_1280.jpg',
            '/static/s3/upload/sample/rentPiece/photos/9d8fbb75-4731-4c10-8150-9cdbcb8c5f00/459664995914653481.jpg'
          ],
          floorPlans: [
            '/static/s3/upload/sample/rentPiece/floorPlans/7964f2ee-dc31-4145-b305-ee8f08fabae6/3.jpg'
          ],
          floorPlanThumbnails: [
            '/static/s3/upload/sample/rentPiece/floorPlans/7964f2ee-dc31-4145-b305-ee8f08fabae6/3.jpg'
          ],
          previews: [
            '/static/s3/upload/sample/rentPiece/previews/62095e73-94c1-4df0-91cf-8bb9a18f537e/A05.jpg'
          ],
          previewThumbnails: [
            '/static/s3/upload/sample/rentPiece/previews/62095e73-94c1-4df0-91cf-8bb9a18f537e/A05.jpg'
          ]
        }]
        rentPieceService.insertRentPieces(req.body.user, rentPieces, (error, inserted) => {
          if (error) {
            return reject(error)
          } else {
            resolve(inserted)
          }
        })
      }),
      new Promise((resolve, reject) => {
        let topics = [{
          user: req.body.user._id,
          type: 'リリース',
          text: '「ブドウさん」がリリースしました。不動産会社向けの便利なサービスが搭載しておりますので、ぜひご利用ください。',
          idate: 1525705200000.0
        }]
        topicService.insertTopics(req.body.user, topics, (error, inserted) => {
          if (error) {
            return reject(error)
          } else {
            resolve(inserted)
          }
        })
      })
    ]).then((values) => {
      let user = values[0]
      res.json({error: null, data: {user: user}})
    }, (reason) => {
      res.json({error: reason, data: null})
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
