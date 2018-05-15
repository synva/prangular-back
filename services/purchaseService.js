import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import utils from './utils'

class PurchaseService {
  constructor () {
  }
  findAllPurchases (params, next) {
    let filter = []
    if (params._id) {
      filter.push({_id: {$eq: ObjectId(params._id)}})
    }
    if (params.user) {
      filter.push({user: {$eq: params.user}})
    }
    filter.push({deleted: {$ne: true}})

    logger.debug(JSON.stringify({$and : filter}))

    mongo.findAll(
      'purchases',
      {$and : filter},
      {},
      {cdate: -1},
      (error, results) => {
        if (error) {
          next(error, null)
        } else {
          next(null, results)
        }
      }
    )
  }
  insertPurchase (user, purchase, next) {
    let now = new Date()
    now = now.valueOf()
    purchase.cdate = now
    purchase.cuser = user._id
    purchase.udate = now
    purchase.uuser = user._id
    mongo.insert(
      'purchases',
      purchase,
      {},
      (error, result) => {
        if (error) {
          next(error, null)
        } else {
          let inserted = result.ops[0]
          next(null, inserted)
        }
      }
    )
  }
}

export default new PurchaseService()
