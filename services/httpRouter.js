import express from 'express'
import url from 'url'
import logger from './logger.js'

import buyRequestService from './buyRequestService.js'
import sellPieceService from './sellPieceService.js'
import userService from './userService.js'


let router = express.Router()

router.get('/initEstateSell', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('moreBuyRequests:', params)
  buyRequestService.findBuyRequests(params, (error, buyRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {buyRequests: buyRequests, count: count}})
    }
  })
})
router.get('/initEstateBuy', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('initEstateBuy:', params)
  sellPieceService.findSellPieces(params, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  })
})
router.get('/initMySell', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('initMySell:', params)
  sellPieceService.findSellPieces(params, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  })
})
router.get('/findSellPieces', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findSellPieces:', params)
  sellPieceService.findSellPieces(params, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  })
})
router.get('/findSellPieceDetail', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findSellPieceDetail:', params)
  sellPieceService.findSellPieceDetail(params, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  })
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
  // res.json({error: null, data: {posted: 'data'}})
})
router.get('/moreSellPieces', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('moreSellPieces:', params)
  sellPieceService.findSellPieces(JSON.parse(params.filter), (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  }, JSON.parse(params.paging))
})
router.get('/moreBuyRequests', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('moreBuyRequests:', params)
  buyRequestService.findBuyRequests(JSON.parse(params.filter), (error, buyRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {buyRequests: buyRequests, count: count}})
    }
  }, JSON.parse(params.paging))
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
  // res.json({error: null, data: {posted: 'data'}})
})

module.exports = router
