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
