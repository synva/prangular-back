import express from 'express'
import fs from 'fs'
import path from 'path'
import url from 'url'
import logger from './logger.js'
import conf from 'config'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import userService from './userService.js'

let router = express.Router()

router.get('/getData', (req, res) => {
  let url_parts = url.parse(req.url, true)
  logger.info('getData params:', JSON.stringify(url_parts.query))
  res.json({error: null, data: {got: 'data'}})
})
router.post('/postData', (req, res) => {
  logger.info('postData:', JSON.stringify(req.body))
  res.json({error: null, data: {posted: 'data'}})
})
router.put('/putData', (req, res) => {
  logger.info('putData:', JSON.stringify(req.body))
  res.json({error: null, data: {puted: 'data'}})
})
router.delete('/deleteData', (req, res) => {
  let url_parts = url.parse(req.url, true)
  logger.info('deleteData params:', JSON.stringify(url_parts.query))
  res.json({error: null, data: {deleted: 'data'}})
})

module.exports = router
