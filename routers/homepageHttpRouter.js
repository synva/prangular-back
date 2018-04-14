import express from 'express'
import url from 'url'
import logger from '../services/logger.js'
import utils from '../services/utils.js'

import sellPieceService from '../services/sellPieceService.js'
import rentPieceService from '../services/rentPieceService.js'
import infoService from '../services/infoService.js'
import homepageService from '../services/homepageService.js'

let router = express.Router()

/**
 * homepage
 */
router.get('/getHomepage', (req, res) => {
  let domain = utils.getDomain(req)
  if (!domain) return res.json({error: {code: 'S002'}, data: null})
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
  let domain = utils.getDomain(req)
  if (!domain) return res.json({error: {code: 'S002'}, data: null})
  logger.info('hp findSellPieces:', domain)

  homepageService.getUser(domain, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      filter.contactID = user._id
      logger.info('filter:', JSON.stringify(filter))

      sellPieceService.findAllSellPieces(filter, (error, sellPieces) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          sellPieces.forEach(one => {
            one.contact = user
          })
          res.json({error: null, data: sellPieces})
        }
      })
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
  let domain = utils.getDomain(req)
  if (!domain) return res.json({error: {code: 'S002'}, data: null})
  logger.info('hp findRentPieces:', domain)

  homepageService.getUser(domain, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      filter.contactID = user._id
      logger.info('filter:', JSON.stringify(filter))

      rentPieceService.findAllRentPieces(filter, (error, rentPieces) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          rentPieces.forEach(one => {
            one.contact = user
          })
          res.json({error: null, data: rentPieces})
        }
      })
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
  let domain = utils.getDomain(req)
  if (!domain) return res.json({error: {code: 'S002'}, data: null})
  logger.info('hp findInfos:', domain)

  homepageService.getUser(domain, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      filter.user = user._id
      logger.info('filter:', JSON.stringify(filter))

      infoService.findAllInfos(filter, (error, infos) => {
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
