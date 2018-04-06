import express from 'express'
import url from 'url'
import logger from './logger.js'
import utils from './utils.js'

import sellPieceService from './sellPieceService.js'
import rentPieceService from './rentPieceService.js'
import contactService from './contactService.js'
import homepageService from './homepageService.js'

let router = express.Router()

/**
 * homepage
 */
router.get('/getHomepage', (req, res) => {
  let domain = req.headers.origin.toLowerCase()
  logger.info('getHomepage:', domain)
  homepageService.getUser(domain, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      if (user == null) {
        res.json({error: {code: 'S999'}, data: null})
        return
      }
      homepageService.getHomepages([domain], (error, configs) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: configs[0]})
        }
      })
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
  logger.info('findRentPieces:', params)

  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }

  let page = utils.parseInt(params.page)

  logger.info('filter:', filter)
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

module.exports = router
