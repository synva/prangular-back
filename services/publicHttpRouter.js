import express from 'express'
import url from 'url'
import logger from './logger.js'

import buyRequestService from './buyRequestService.js'
import sellPieceService from './sellPieceService.js'
import borrowRequestService from './borrowRequestService.js'
import rentPieceService from './rentPieceService.js'

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
router.get('/initEstateRent', (req, res) => {
  logger.info('initEstateRent url:', req.url)
  const params = url.parse(req.url, true).query
  logger.info('initEstateRent:', params)
  rentPieceService.findRentPieces(params, (error, rentPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {rentPieces: rentPieces, count: count}})
    }
  })
})
router.get('/initEstateBorrow', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('initEstateBorrow:', params)
  borrowRequestService.findBorrowRequests(params, (error, borrowRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {borrowRequests: borrowRequests, count: count}})
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
  logger.info('filter:', filter)
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

  buyRequestService.findBuyRequestDetail(filter, (error, buyRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {buyRequests: buyRequests, count: count}})
    }
  }, paging)
})
router.get('/findRentPieceDetail', (req, res) => {
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
  rentPieceService.findRentPieceDetail(filter, (error, RentPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {RentPieces: RentPieces, count: count}})
    }
  }, paging)
})
router.get('/findBorrowRequestDetail', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('findBorrowRequestDetail:', params)
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

  borrowRequestService.findBorrowRequestDetail(filter, (error, borrowRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {borrowRequests: borrowRequests, count: count}})
    }
  }, paging)
})

module.exports = router
