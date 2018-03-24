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
* findSellPieces
*/
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

  logger.info('findSellPieces:', params)
  sellPieceService.findSellPieces(params, (error, sellPieces, count) => {
    sellPieces.reduce((p, _, i) =>
        p.then(_ => new Promise(resolve => {
          userService.getUserInfoByID(sellPieces[i].contactID, (err, userinfo) => {
            sellPieces[i].contact = userinfo
            resolve()
          })
        }))
    , Promise.resolve()).then(() => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {datas: sellPieces, count: count}})
      }
    })
  }, paging)
})

/*
* findBuyRequests
*/
router.get('/findBuyRequests', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findBuyRequests:', params)
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

  buyRequestService.findBuyRequests(filter, (error, buyRequests, count) => {
    buyRequests.reduce((p, _, i) =>
        p.then(_ => new Promise(resolve => {
          userService.getUserInfoByID(buyRequests[i].contactID, (err, userinfo) => {
            buyRequests[i].contact = userinfo
            resolve()
          })
        }))
    , Promise.resolve()).then(() => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {datas: buyRequests, count: count}})
      }
    })
  }, paging)
})

/*
* findRentPieceDetail
*/
router.get('/findRentPieces', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findRentPieceDetail:', params)

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

  logger.info('filter:', filter)
  rentPieceService.findRentPieces(filter, (error, rentPieces, count) => {
    rentPieces.reduce((p, _, i) =>
        p.then(_ => new Promise(resolve => {
          userService.getUserInfoByID(rentPieces[i].contactID, (err, userinfo) => {
            rentPieces[i].contact = userinfo
            resolve()
          })
        }))
    , Promise.resolve()).then(() => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {datas: rentPieces, count: count}})
      }
    })
  }, paging)
})

/*
* findBorrowRequest
*/
router.get('/findBorrowRequests', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findBorrowRequest:', params)
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

  borrowRequestService.findBorrowRequests(filter, (error, borrowRequests, count) => {
    borrowRequests.reduce((p, _, i) =>
        p.then(_ => new Promise(resolve => {
          userService.getUserInfoByID(borrowRequests[i].contactID, (err, userinfo) => {
            borrowRequests[i].contact = userinfo
            resolve()
          })
        }))
    , Promise.resolve()).then(() => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: {datas: borrowRequests, count: count}})
      }
    })
  }, paging)
})

module.exports = router
