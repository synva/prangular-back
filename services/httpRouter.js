import express from 'express'
import url from 'url'
import logger from './logger.js'

import buyRequestService from './buyRequestService.js'

let router = express.Router()

router.get('/initEstateSell', (req, res) => {
  let url_parts = url.parse(req.url, true)
  logger.info('initEstateSell:', JSON.stringify(url_parts.query))
  buyRequestService.findBuyRequests(url_parts.query, (error, buyRequests, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {buyRequests: buyRequests, count: count}})
    }
  })
})
router.post('/postData', (req, res) => {
  logger.info('postData:', JSON.stringify(req.body))
  res.json({error: null, data: {posted: 'data'}})
})
router.put('/insertBuyRequest', (req, res) => {
  logger.info('insertBuyRequest:', JSON.stringify(req.body))
  buyRequestService.insertBuyRequest(req.session.passport.user, req.body, (error, buyRequest) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: buyRequest})
    }
  })
})
router.delete('/deleteData', (req, res) => {
  let url_parts = url.parse(req.url, true)
  logger.info('deleteData params:', JSON.stringify(url_parts.query))
  res.json({error: null, data: {deleted: 'data'}})
})

module.exports = router
