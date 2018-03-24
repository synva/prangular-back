import express from 'express'
import url from 'url'
import logger from './logger.js'

import buyRequestService from './buyRequestService.js'
import sellPieceService from './sellPieceService.js'
import borrowRequestService from './borrowRequestService.js'
import rentPieceService from './rentPieceService.js'
import userService from './userService.js'

let router = express.Router()

/*
* User
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

/*
* Sell
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
// router.get('/initMySell', (req, res) => {
//   const params = url.parse(req.url, true).query
//   logger.info('initMySell:', params)
//   sellPieceService.findSellPieces(params, (error, sellPieces, count) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {datas: sellPieces, count: count}})
//     }
//   })
// })
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

  let paging = null
  if (params.paging) {
    if (typeof params.paging === 'string' || params.paging instanceof String) {
      paging = JSON.parse(params.paging)
    } else {
      paging = params.paging
    }
  }

  filter.contactID = req.session.passport.user._id
  logger.info('findSellPieces:', params)

  sellPieceService.findSellPieces(params, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: sellPieces, count: count}})
    }
  }, paging)
})

router.post('/updateSellPiece', (req, res) => {
  logger.info('updateSellPiece:', req.body)

  userService.getUserInfoByID(req.session.passport.user._id, (err, userinfo) => {
    sellPieceService.updateSellPiece(userinfo, req.body, (error, sellPiece) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {sellPiece: sellPiece}})
      }
    })
  })
})

/*
* Buy
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

  let paging = null
  if (params.paging) {
    if (typeof params.paging === 'string' || params.paging instanceof String) {
      paging = JSON.parse(params.paging)
    } else {
      paging = params.paging
    }
  }

  filter.contactID = req.session.passport.user._id
  logger.info('findBuyRequests:', filter)

  buyRequestService.findBuyRequests(filter, (error, buyRequests, count) => {
    // buyRequests.reduce((p, _, i) =>
    //     p.then(_ => new Promise(resolve => {
    //       userService.getUserInfoByID(buyRequests[i].contactID, (err, userinfo) => {
    //         buyRequests[i].contact = userinfo
    //         resolve()
    //       })
    //     }))
    // , Promise.resolve()).then(() => {
    //   if (error) {
    //     res.json({error: error, data: null})
    //   } else {
    //     res.json({error: null, data: {datas: buyRequests, count: count}})
    //   }
    // })
    // userService.getUserInfoByID(req.session.passport.user._id, (err, userinfo) => {
    //   let returnUserInfo = {
    //     maxPublish: userinfo.maxPublish,
    //     role: userinfo.role,
    //     _id: userinfo._id
    //   }
    //   if (error) {
    //     res.json({error: error, data: null})
    //   } else {
    //     buyRequests.forEach (function (v, i, a) {
    //       v.contact = returnUserInfo
    //     })
    //     res.json({error: null, data: {datas: buyRequests, count: count}})
    //   }
    // })
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: buyRequests, count: count}})
    }
  }, paging)
})

router.post('/updateBuyRequest', (req, res) => {
  logger.info('updateBuyRequest:', req.body)

  userService.getUserInfoByID(req.session.passport.user._id, (err, userinfo) => {
    buyRequestService.updateBuyRequest(userinfo, req.body, (error, buyRequest) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {buyRequest: buyRequest}})
      }
    })
  })
})

/*
* Borrow
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

  let paging = null
  if (params.paging) {
    if (typeof params.paging === 'string' || params.paging instanceof String) {
      paging = JSON.parse(params.paging)
    } else {
      paging = params.paging
    }
  }

  filter.contactID = req.session.passport.user._id
  logger.info('findBorrowRequests:', filter)

  borrowRequestService.findBorrowRequests(filter, (error, borrowRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: borrowRequests, count: count}})
    }
  }, paging)
})

router.post('/updateBorrowRequest', (req, res) => {
  logger.info('updateBorrowRequest:', req.body)

  userService.getUserInfoByID(req.session.passport.user._id, (err, userinfo) => {
    borrowRequestService.updateBorrowRequest(userinfo, req.body, (error, borrowRequest) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {borrowRequest: borrowRequest}})
      }
    })
  })
})

/*
* Rent
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

  let paging = null
  if (params.paging) {
    if (typeof params.paging === 'string' || params.paging instanceof String) {
      paging = JSON.parse(params.paging)
    } else {
      paging = params.paging
    }
  }

  filter.contactID = req.session.passport.user._id
  logger.info('findRentPieces:', filter)

  rentPieceService.findRentPieces(filter, (error, rentPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: rentPieces, count: count}})
    }
  }, paging)
})

router.post('/updateRentPiece', (req, res) => {
  logger.info('updateRentPiece:', req.body)

  userService.getUserInfoByID(req.session.passport.user._id, (err, userinfo) => {
    rentPieceService.updateRentPiece(userinfo, req.body, (error, rentPiece) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {rentPiece: rentPiece}})
      }
    })
  })
})

module.exports = router
