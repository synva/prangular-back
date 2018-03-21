import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import moment from 'moment'

class BorrowRequestService {
  constructor () {
  }
  findBorrowRequests (params, next, paging) {
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
      'borrowRequests',
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
  insertBorrowRequest (user, borrowRequest, next) {
    let now = new Date()
    now = now.valueOf()
    borrowRequest.cdate = now
    borrowRequest.cuser = user._id
    borrowRequest.agent = user._id
    borrowRequest.udate = now
    borrowRequest.uuser = user._id
    mongo.insert(
      'borrowRequests',
      borrowRequest,
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
  updateBorrowRequest (user, borrowRequest, next) {
    let id = borrowRequest._id
    delete borrowRequest._id
    borrowRequest.uuser = user._id
    let now = new Date()
    borrowRequest.udate = now.valueOf()
    mongo.update(
      'borrowRequests',
      {_id: ObjectId(id)},
      {$set: borrowRequest},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          borrowRequest._id = id
          next(null, borrowRequest)
        }
      }
    )
  }
}

export default new BorrowRequestService()
