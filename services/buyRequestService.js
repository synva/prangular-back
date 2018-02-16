import logger from './logger.js'
import mongo from './mongo.js'

class BuyRequestService {
  constructor () {
  }
  findBuyRequests (filter, next, paging) {
    filter.deleted = {$ne: true}
    mongo.find(
      'buyRequests',
      filter,
      {sort: {_id: -1}},
      (error, result, count) => {
        if (error) {
          next(error, null)
        } else {
          next(null, result, count)
        }
      },
      paging
    )
  }
  insertBuyRequest (user, buyRequest, next) {
    let now = new Date()
    now = now.valueOf()
    buyRequest.cdate = now
    buyRequest.cuser = user._id
    buyRequest.udate = now
    buyRequest.uuser = user._id
    mongo.insert(
      'buyRequests',
      buyRequest,
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

export default new BuyRequestService()
