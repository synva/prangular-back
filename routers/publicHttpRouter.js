import express from 'express'
import url from 'url'
import logger from '../services/logger.js'
import utils from '../services/utils.js'

import buyRequestService from '../services/buyRequestService.js'
import sellPieceService from '../services/sellPieceService.js'
import borrowRequestService from '../services/borrowRequestService.js'
import rentPieceService from '../services/rentPieceService.js'
import contactService from '../services/contactService.js'
import userService from '../services/userService.js'

let router = express.Router()

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

  logger.info('public findSellPieces:', JSON.stringify(filter))
  logger.info('page:', page)

  sellPieceService.findSellPieces(filter, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      contactService.assignContacts(sellPieces, (error) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {datas: sellPieces, count: count}})
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

  logger.info('public findRentPieces:', JSON.stringify(filter))
  logger.info('page:', page)

  rentPieceService.findRentPieces(filter, (error, rentPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      contactService.assignContacts(rentPieces, (error) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {datas: rentPieces, count: count}})
        }
      })
    }
  }, page)
})

/**
 * buyRequest
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

  let page = utils.parseInt(params.page)

  buyRequestService.findBuyRequests(filter, (error, buyRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      contactService.assignContacts(buyRequests, (error) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {datas: buyRequests, count: count}})
        }
      })
    }
  }, page)
})

/**
 * borrowRequest
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

  let page = utils.parseInt(params.page)

  borrowRequestService.findBorrowRequests(filter, (error, borrowRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      contactService.assignContacts(borrowRequests, (error) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: {datas: borrowRequests, count: count}})
        }
      })
    }
  }, page)
})

/**
 * company homepage
 */
router.get('/getCompanyConfig', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.info('getCompanyConfig:', params)
  userService.getUser(params.domain, (error, userInfo) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      logger.info('userInfo:', userInfo)
      res.json({error: null, data: {datas: userInfo}})
    }
  })
})

module.exports = router