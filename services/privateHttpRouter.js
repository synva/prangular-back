import express from 'express'
import url from 'url'
import logger from './logger.js'

import buyRequestService from './buyRequestService.js'
import sellPieceService from './sellPieceService.js'
import userService from './userService.js'


let router = express.Router()

router.get('/initMySell', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('initMySell:', params)
  sellPieceService.findSellPieces(params, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: sellPieces, count: count}})
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
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {datas: sellPieces, count: count}})
    }
  }, paging)
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
router.post('/postData', (req, res) => {
  logger.info('postData:', req.body)
  res.json({error: null, data: {posted: 'data'}})
})
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
router.delete('/deleteData', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('deleteData:', params)
  res.json({error: null, data: {deleted: 'data'}})
})
router.post('/updateUserInfo', (req, res) => {
  logger.info('updateUserInfo:', req.body)
  userService.updateUser(req.session.passport.user, req.body, (error, userInfo) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPiece: userInfo}})
    }
  })
})

module.exports = router
