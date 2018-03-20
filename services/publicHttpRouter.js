import express from 'express'
import url from 'url'
import logger from './logger.js'

import buyRequestService from './buyRequestService.js'
import sellPieceService from './sellPieceService.js'


let router = express.Router()

router.get('/initEstateSell', (req, res) => {
  logger.info('initEstateSell url:', req.url)
  const params = url.parse(req.url, true).query
  logger.info('initEstateSell:', params)
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

module.exports = router
