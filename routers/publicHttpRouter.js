import express from 'express'
import url from 'url'
import logger from '../services/logger.js'
import utils from '../services/utils.js'

import systemService from '../services/systemService.js'
import sellPieceService from '../services/sellPieceService.js'
import rentPieceService from '../services/rentPieceService.js'
// import buyRequestService from '../services/buyRequestService.js'
// import borrowRequestService from '../services/borrowRequestService.js'
import contactService from '../services/contactService.js'

let router = express.Router()

/**
 * init
 */
router.get('/initApplication', (req, res) => {
  systemService.findInformation((error, information) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {information: information}})
    }
  })
})

/**
 * sellPiece
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
  filter.isPublishing = true
  let page = utils.parseInt(params.page)
  let sort = {}
  if (params.sort) {
    if (typeof params.sort === 'string' || params.sort instanceof String) {
      sort = JSON.parse(params.sort)
    } else {
      sort = params.sort
    }
  }
  sort.udate = -1

  logger.info('public findSellPieces:', JSON.stringify(filter))
  logger.info('page:', page)
  logger.info('sort:', JSON.stringify(sort))

  sellPieceService.findSellPieces(filter, sort, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      contactService.assignContacts(sellPieces, (error) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {sellPieces: sellPieces, count: count}})
        }
      })
    }
  }, page)
})

/**
 * rentPiece
 */
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
  filter.isPublishing = true
  let page = utils.parseInt(params.page)
  let sort = {}
  if (params.sort) {
    if (typeof params.sort === 'string' || params.sort instanceof String) {
      sort = JSON.parse(params.sort)
    } else {
      sort = params.sort
    }
  }
  sort.udate = -1

  logger.info('public findRentPieces:', JSON.stringify(filter))
  logger.info('page:', page)
  logger.info('sort:', JSON.stringify(sort))

  rentPieceService.findRentPieces(filter, sort, (error, rentPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      contactService.assignContacts(rentPieces, (error) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {rentPieces: rentPieces, count: count}})
        }
      })
    }
  }, page)
})

module.exports = router
