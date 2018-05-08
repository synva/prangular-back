import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import utils from './utils'

class SystemService {
  constructor () {
  }
  findInformation (next) {
    mongo.findAll(
      'information',
      {},
      {},
      {},
      (error, results) => {
        if (error) {
          next(error, null)
        } else {
          next(null, results[0])
        }
      }
    )
  }
}

export default new SystemService()
