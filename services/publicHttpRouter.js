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
  sellPieceService.findSellPieces(params, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  })
})
router.get('/initEstateBuy', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('initEstateBuy:', params)
  buyRequestService.findBuyRequests(params, (error, buyRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {buyRequests: buyRequests, count: count}})
    }
  })
})
router.get('/findSellPieceDetail', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findSellPieceDetail:', params)

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

  sellPieceService.findSellPieceDetail(filter, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  }, paging)
})
router.get('/findBuyRequestDetail', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findBuyRequestDetail:', params)
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

  buyRequestService.findBuyRequestDetail(filter, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  }, paging)
})

module.exports = router
