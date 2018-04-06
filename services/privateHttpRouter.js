import express from 'express'
import url from 'url'
import logger from './logger.js'
import utils from './utils.js'

import sellPieceService from './sellPieceService.js'
import rentPieceService from './rentPieceService.js'
import buyRequestService from './buyRequestService.js'
import borrowRequestService from './borrowRequestService.js'
import userService from './userService.js'
import homepageService from './homepageService.js'

let router = express.Router()

/**
 * user
 */
router.post('/updateUser', (req, res) => {
  logger.info('updateUser:', req.body)
  userService.updateUser(req.session.passport.user, req.body, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: user})
    }
  })
})

/**
 * sellPiece
 */
router.put('/insertSellPiece', (req, res) => {
  logger.info('insertSellPiece:', req.body)
  Promise.all([
    new Promise((resolve, reject) => {
      userService.getUser(req.session.passport.user, (error, user) => {
        if (error) return reject(error)
        resolve(user)
      })
    }),
    new Promise((resolve, reject) => {
      sellPieceService.findSellPieces({contactID: req.session.passport.user._id}, (error, sellPieces, count) => {
        if (error) return reject(error)
        resolve(count)
      })
    })
  ]).then((values) => {
    let user = values[0]
    let count = values[1]
    logger.debug('max sell count:', user.maxSell)
    logger.debug('current count:', count)
    if (count >= user.maxSell) return res.json({error: {code: 'B008', detail: '登録可能件数：' + user.maxSell}, data: null})
    sellPieceService.insertSellPiece(user, req.body, (error, sellPiece) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: sellPiece})
      }
    })
  }, (reason) => {
    res.json({error: reason, data: null})
  })
})
router.get('/findSellPieces', (req, res) => {
  const params = url.parse(req.url, true).query
  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }
  filter.contactID = req.session.passport.user._id
  let page = utils.parseInt(params.page)

  logger.info('private findSellPieces:', JSON.stringify(filter))
  logger.info('page:', page)

  sellPieceService.findSellPieces(filter, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: sellPieces, count: count}})
    }
  }, page)
})
router.post('/updateSellPiece', (req, res) => {
  logger.info('updateSellPiece:', req.body)
  sellPieceService.updateSellPiece(req.session.passport.user, req.body, (error, sellPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPiece: sellPiece}})
    }
  })
})
router.post('/deleteSellPiece', (req, res) => {
  logger.info('deleteSellPiece:', req.body)
  sellPieceService.deleteSellPiece(req.session.passport.user, req.body, (error, sellPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPiece: sellPiece}})
    }
  })
})

/**
 * rentPiece
 */
router.put('/insertRentPiece', (req, res) => {
  logger.info('insertRentPiece:', req.body)
  Promise.all([
    new Promise((resolve, reject) => {
      userService.getUser(req.session.passport.user, (error, user) => {
        if (error) return reject(error)
        resolve(user)
      })
    }),
    new Promise((resolve, reject) => {
      rentPieceService.findRentPieces({contactID: req.session.passport.user._id}, (error, rentPieces, count) => {
        if (error) return reject(error)
        resolve(count)
      })
    })
  ]).then((values) => {
    let user = values[0]
    let count = values[1]
    logger.debug('max sell count:', user.maxRent)
    logger.debug('current count:', count)
    if (count >= user.maxRent) return res.json({error: {code: 'B008', detail: '登録可能件数：' + user.maxRent}, data: null})
    rentPieceService.insertRentPiece(user, req.body, (error, rentPiece) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: rentPiece})
      }
    })
  }, (reason) => {
    res.json({error: reason, data: null})
  })
})
router.get('/findRentPieces', (req, res) => {
  const params = url.parse(req.url, true).query
  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }
  filter.contactID = req.session.passport.user._id
  let page = utils.parseInt(params.page)

  logger.info('private findRentPieces:', JSON.stringify(filter))
  logger.info('page:', page)

  rentPieceService.findRentPieces(filter, (error, rentPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: rentPieces, count: count}})
    }
  }, page)
})
router.post('/updateRentPiece', (req, res) => {
  logger.info('updateRentPiece:', req.body)
  rentPieceService.updateRentPiece(req.session.passport.user, req.body, (error, rentPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {rentPiece: rentPiece}})
    }
  })
})
router.post('/deleteRentPiece', (req, res) => {
  logger.info('deleteRentPiece:', req.body)
  rentPieceService.deleteRentPiece(req.session.passport.user, req.body, (error, rentPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {rentPiece: rentPiece}})
    }
  })
})

/**
 * buyRequest
 */
router.put('/insertBuyRequest', (req, res) => {
  logger.info('insertBuyRequest:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      buyRequestService.insertBuyRequest(user, req.body, (error, buyRequest) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: buyRequest})
        }
      })
    }
  })
})

router.get('/findBuyRequests', (req, res) => {
  const params = url.parse(req.url, true).query

  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }

  let page = utils.parseInt(params.page)

  filter.contactID = req.session.passport.user._id
  logger.info('findBuyRequests:', filter)
  logger.info('page:', page)

  buyRequestService.findBuyRequests(filter, (error, buyRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: buyRequests, count: count}})
    }
  }, page)
})

router.post('/updateBuyRequest', (req, res) => {
  logger.info('updateBuyRequest:', req.body)

  buyRequestService.updateBuyRequest(req.session.passport.user, req.body, (error, buyRequest) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {buyRequest: buyRequest}})
    }
  })
})

router.post('/publishBuyRequest', (req, res) => {
  logger.info('publishBuyRequest:', req.body)

  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      buyRequestService.publishBuyRequest(user, req.body, (error, buyRequest) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {buyRequest: buyRequest}})
        }
      })
    }
  })
})
router.post('/unPublishBuyRequest', (req, res) => {
  logger.info('unPublishBuyRequest:', req.body)

  buyRequestService.publishBuyRequest(req.session.passport.user, req.body, (error, buyRequest) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {buyRequest: buyRequest}})
    }
  })
})
router.post('/deleteBuyRequest', (req, res) => {
  logger.info('deleteBuyRequest:', req.body)
  buyRequestService.deleteBuyRequest(req.session.passport.user, req.body, (error, buyRequest) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {buyRequest: buyRequest}})
    }
  })
})

/**
 * borrowRequest
 */
router.put('/insertBorrowRequest', (req, res) => {
  logger.info('insertBorrowRequest:', req.body)
  borrowRequestService.insertBorrowRequest(req.session.passport.user, req.body, (error, borrowRequest) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: borrowRequest})
    }
  })
})

router.get('/findBorrowRequests', (req, res) => {
  const params = url.parse(req.url, true).query

  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }

  let page = utils.parseInt(params.page)

  filter.contactID = req.session.passport.user._id

  logger.info('findBorrowRequests:', params)
  logger.info('page:', page)

  borrowRequestService.findBorrowRequests(filter, (error, borrowRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: borrowRequests, count: count}})
    }
  }, page)
})
router.post('/updateBorrowRequest', (req, res) => {
  logger.info('updateBorrowRequest:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      borrowRequestService.updateBorrowRequest(user, req.body, (error, borrowRequest) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {borrowRequest: borrowRequest}})
        }
      })
    }
  })
})
router.post('/publishBorrowRequest', (req, res) => {
  logger.info('publishBorrowRequest:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      borrowRequestService.publishBorrowRequest(user, req.body, (error, borrowRequest) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {borrowRequest: borrowRequest}})
        }
      })
    }
  })
})
router.post('/unPublishBorrowRequest', (req, res) => {
  logger.info('unPublishBorrowRequest:', req.body)
  borrowRequestService.publishBorrowRequest(req.session.passport.user, req.body, (error, borrowRequest) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {borrowRequest: borrowRequest}})
    }
  })
})
router.post('/deleteBorrowRequest', (req, res) => {
  logger.info('deleteBorrowRequest:', req.body)
  borrowRequestService.deleteBorrowRequest(req.session.passport.user, req.body, (error, borrowRequest) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {borrowRequest: borrowRequest}})
    }
  })
})

/*
* HomePage
*/
router.put('/insertHomePageSetting', (req, res) => {
  logger.info('insertHomePageSetting:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      homepageService.insertHomePageSetting(user, req.body, (error, HomePageSetting) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          user.homepagedomain.push(HomePageSetting.domain)
          logger.debug('updateUser start')
          userService.updateUser(user, user, (error, userinfo) => {
            logger.debug('updateUser end:', error)
            if (error) {
              res.json({error: error, data: null})
            } else {
              res.json({error: null, data: HomePageSetting})
            }
          })
        }
      })
    }
  })
})
router.get('/getHomePageInfo', (req, res) => {
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      homepageService.getHomePageInfoByDomain(user.homepagedomain, (error, homepageInfos, count) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {datas: homepageInfos, count: count}})
        }
      })
    }
  })
})
router.get('/findHomePageSetting', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findHomePageSetting:', params)
  homepageService.getHomePageInfoByDomain([params.domain], (error, homepageInfos, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: homepageInfos, count: count}})
    }
  })
})
router.get('/findHomePageSettingByID', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findHomePageSetting:', params)
  homepageService.getHomePageInfoByID(params, (error, homepageInfos, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: homepageInfos, count: count}})
    }
  })
})
router.post('/updateHomePageSetting', (req, res) => {
  logger.info('updateHomePageSetting:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      const setting = req.body
      logger.debug('getHomePageInfoByID start:', setting._id)
      homepageService.getHomePageInfoByID({_id:setting._id}, (error, origin_homepageInfo, count) => {
        logger.debug('getHomePageInfoByID end:', error)
        if (error) {
          res.json({error: error, data: null})
        } else {

          logger.debug('updateHomePageSetting start:', setting)
          homepageService.updateHomePageSetting(user, setting, (error, homepageInfo) => {
            logger.debug('updateHomePageSetting end:', error)
            if (error) {
              res.json({error: error, data: null})
            } else {

              logger.debug('origin domain:', origin_homepageInfo[0].domain)
              logger.debug('setting.domain:', setting.domain)
              if (origin_homepageInfo[0].domain !== setting.domain) {
                for (let i in user.homepagedomain) {
                  if (user.homepagedomain[i] === origin_homepageInfo[0].domain) {
                    user.homepagedomain[i] = setting.domain
                    logger.debug('set domain:', user.homepagedomain)
                    break
                  }
                }
                logger.debug('updateUser start')
                userService.updateUser(user, user, (error, userinfo) => {
                  logger.debug('updateUser end:', error)
                  if (error) {
                    res.json({error: error, data: null})
                  } else {
                    res.json({error: null, data: homepageInfo})
                  }
                })
              } else {
                res.json({error: null, data: homepageInfo})
              }
            }
          })
        }
      })
    }
  })
})
router.post('/deleteHomePageSetting', (req, res) => {
  logger.info('deleteHomePageSetting:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      const setting = req.body
      homepageService.getHomePageInfoByID({_id:setting._id}, (error, origin_homepageInfo, count) => {
        logger.debug('getHomePageInfoByID end:', error)
        if (error) {
          res.json({error: error, data: null})
        } else {
          homepageService.deleteHomePageSetting(user, req.body, (error, homepageInfo) => {
            if (error) {
              res.json({error: error, data: null})
            } else {
              for (let i in user.homepagedomain) {
                if (user.homepagedomain[i] === origin_homepageInfo[0].domain) {
                  user.homepagedomain.splice(i, 1)
                  logger.debug('set domain:', user.homepagedomain)
                  break
                }
              }
              logger.debug('updateUser start')
              userService.updateUser(user, user, (error, userinfo) => {
                logger.debug('updateUser end:', error)
                if (error) {
                  res.json({error: error, data: null})
                } else {
                  res.json({error: null, data: homepageInfo})
                }
              })
            }
          })
        }
      })
    }
  })
})

module.exports = router
