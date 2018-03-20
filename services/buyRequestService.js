import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import moment from 'moment'

class BuyRequestService {
  constructor () {
  }
  findBuyRequests (params, next, paging) {
    let id = null
    let filter = {}
    if (params._id) {
      filter._id = ObjectId(params._id)
    }

    if (params.line) {
      let regexp = new RegExp('.*' + params.line + '.*')
      filter.line = regexp
    }

    if (params.station) {
      let regexp = new RegExp('.*' + params.station + '.*')
      filter.station = regexp
    }

    // if (params.requiredTimeFrom) {
    //   filter.requiredTimeFrom = {$gte: params.requiredTimeFrom}
    // }

    // if (params.requiredTimeTo) {
    //   filter.requiredTimeFrom = {$gt: params.requiredTimeFrom}
    // }

    if (params.isNew) {
      filter.isnew = {$eq: params.isNew}
    }

    if (params.type) {
      filter.type = {$eq: params.type}
    }

    if (params.isLatest === 'true') {
      let dateBeforeWeek = moment().add(7, 'days')
      filter.udate = {$gte: dateBeforeWeek.unix()}
    }

    if (params.agent) {
      filter.agent = {$eq: params.agent}
    }

    filter.deleted = {$ne: true}
    console.log(filter)// eslint-disable-line

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
    buyRequest.agent = user._id
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
  updateBuyRequest (user, buyRequest, next) {
    let id = buyRequest._id
    delete buyRequest._id
    buyRequest.uuser = user._id
    let now = new Date()
    buyRequest.udate = now.valueOf()
    mongo.update(
      'buyRequests',
      {_id: ObjectId(id)},
      {$set: buyRequest},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          buyRequest._id = id
          next(null, buyRequest)
        }
      }
    )
  }
}

export default new BuyRequestService()
