import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import utils from './utils'

class InquiryService {
  constructor () {
  }
  findAllInquiries (params, next) {
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
      'inquiries',
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
  insertInquiry (inquiry, next) {
    let now = new Date()
    now = now.valueOf()
    inquiry.cdate = now
    inquiry.cuser = 'anonymous'
    inquiry.udate = now
    inquiry.uuser = 'anonymous'
    mongo.insert(
      'inquiries',
      inquiry,
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
  updateInquiry (user, inquiry, next) {
    let id = inquiry._id
    delete inquiry._id
    inquiry.uuser = user._id
    let now = new Date()
    inquiry.udate = now.valueOf()
    mongo.update(
      'inquiries',
      {_id: ObjectId(id)},
      {$set: inquiry},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          inquiry._id = id
          next(null, inquiry)
        }
      }
    )
  }
  deleteInquiry (user, inquiry, next) {
    let json = {
      _id: inquiry._id,
      deleted: true
    }
    this.updateInquiry(user, json, next)
  }
}

export default new InquiryService()
