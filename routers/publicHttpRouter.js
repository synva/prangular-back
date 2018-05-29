import express from 'express'
import url from 'url'
import logger from '../services/logger.js'
import utils from '../services/utils.js'

// import systemService from '../services/systemService.js'

let router = express.Router()

/**
 * init
 */
router.get('/getData', (req, res) => {
  const params = url.parse(req.url, true).query
  logger.debug('getData:', JSON.stringify(params))

  if (req.session && req.session.passport && req.session.passport.user) {
    logger.debug('user:', req.session.passport.user._id)
  }

  res.json({error: null, data: {col: 'test111'}})
})
router.post('/postData', (req, res) => {
  logger.info('postData:', JSON.stringify(req.body))
  res.json({error: null, data: {col: 'test222'}})
})
router.put('/putData', (req, res) => {
  logger.info('putData:', JSON.stringify(req.body))
  res.json({error: null, data: {col: 'test333'}})
})

module.exports = router
