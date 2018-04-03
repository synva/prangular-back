import express from 'express'
import url from 'url'
import logger from './logger.js'
import utils from './utils.js'

import buyRequestService from './buyRequestService.js'
import sellPieceService from './sellPieceService.js'
import borrowRequestService from './borrowRequestService.js'
import rentPieceService from './rentPieceService.js'
import userService from './userService.js'

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
  sellPieceService.insertSellPiece(req.session.passport.user, req.body, (error, sellPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: sellPiece})
    }
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
router.post('/publishSellPiece', (req, res) => {
  logger.info('publishSellPiece:', req.body)
  userService.getUserInfoByID(req.session.passport.user._id, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      sellPieceService.publishSellPiece(user, req.body, (error, sellPiece) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {sellPiece: sellPiece}})
        }
      })
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
 * buyRequest
 */
router.put('/insertBuyRequest', (req, res) => {
  logger.info('insertBuyRequest:', req.body)
  buyRequestService.insertBuyRequest(req.session.passport.user, req.body, (error, buyRequest) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: buyRequest})
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

  userService.getUserInfoByID(req.session.passport.user._id, (error, user) => {
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
  userService.getUserInfoByID(req.session.passport.user._id, (error, user) => {
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
  userService.getUserInfoByID(req.session.passport.user._id, (error, user) => {
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

/**
 * rentPiece
 */
router.put('/insertRentPiece', (req, res) => {
  logger.info('insertRentPiece:', req.body)
  rentPieceService.insertRentPiece(req.session.passport.user, req.body, (error, rentPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: rentPiece})
    }
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

  let page = utils.parseInt(params.page)

  filter.contactID = req.session.passport.user._id

  logger.info('findRentPieces:', params)
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
  userService.getUserInfoByID(req.session.passport.user._id, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      rentPieceService.updateRentPiece(user, req.body, (error, rentPiece) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {rentPiece: rentPiece}})
        }
      })
    }
  })
})
router.post('/publishRentPiece', (req, res) => {
  logger.info('publishRentPiece:', req.body)
  userService.getUserInfoByID(req.session.passport.user._id, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      rentPieceService.publishRentPiece(user, req.body, (error, rentPiece) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {rentPiece: rentPiece}})
        }
      })
    }
  })
})
router.post('/unPublishRentPiece', (req, res) => {
  logger.info('unPublishRentPiece:', req.body)
  rentPieceService.publishRentPiece(req.session.passport.user, req.body, (error, rentPiece) => {
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

module.exports = router
