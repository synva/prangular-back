import express from 'express'
import url from 'url'
import logger from './logger.js'
import utils from './utils.js'

import sellPieceService from './sellPieceService.js'
import rentPieceService from './rentPieceService.js'
import infoService from './infoService.js'
import homepageService from './homepageService.js'

let router = express.Router()

/**
 * homepage
 */
router.get('/getHomepage', (req, res) => {
  let domain = req.headers.origin.toLowerCase().split('//')[1]
  logger.info('getHomepage:', domain)
  homepageService.getUser(domain, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      homepageService.getHomepages([domain], (error, homepages) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: homepages[0]})
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

  let domain = req.headers.origin.toLowerCase().split('//')[1]
  logger.info('hp findSellPieces:', domain)
  homepageService.getUser(domain, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      filter.contactID = user._id

      logger.info('filter:', JSON.stringify(filter))
      logger.info('page:', page)

      sellPieceService.findSellPieces(filter, (error, sellPieces, count) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          sellPieces.forEach(one => {
            one.contact = user
          })
          res.json({error: null, data: {datas: sellPieces, count: count}})
        }
      }, page)
    }
  })
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

  let domain = req.headers.origin.toLowerCase().split('//')[1]
  logger.info('hp findRentPieces:', domain)
  homepageService.getUser(domain, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      filter.contactID = user._id

      logger.info('filter:', JSON.stringify(filter))
      logger.info('page:', page)

      rentPieceService.findRentPieces(filter, (error, rentPieces, count) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          rentPieces.forEach(one => {
            one.contact = user
          })
          res.json({error: null, data: {datas: rentPieces, count: count}})
        }
      }, page)
    }
  })
})

/**
 * info
 */
router.get('/findInfos', (req, res) => {
  const params = url.parse(req.url, true).query
  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }

  let domain = req.headers.origin.toLowerCase().split('//')[1]
  logger.info('hp findInfos:', domain)
  homepageService.getUser(domain, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      filter.user = user._id

      logger.info('filter:', JSON.stringify(filter))

      infoService.findInfos(filter, (error, infos) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: infos})
        }
      })
    }
  })
})

module.exports = router
