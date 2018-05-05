import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import moment from 'moment'
import utils from './utils'

class BorrowRequestService {
  constructor () {
  }
  findBorrowRequests (params, next, page) {
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

    if (params.releday) {
      let dateBefore = utils.yearsBefore(params.releday)
      filter.udate = {$gte: dateBefore.valueOf()}
    }

    if (params.contactID) {
      filter.contactID = {$eq: params.contactID}
    }

    filter.deleted = {$ne: true}
    logger.debug('find borrowRequests:', filter)

    mongo.find(
      'borrowRequests',
      filter,
      {},
      {isPublishing: -1, udate: -1},
      (error, result, count) => {
        if (error) {
          next(error, null)
        } else {
          next(null, result, count)
        }
      },
      page
    )
  }
  insertBorrowRequest (user, borrowRequest, next) {
    let now = new Date()
    now = now.valueOf()
    borrowRequest.cdate = now
    borrowRequest.cuser = user._id
    borrowRequest.contactID = user._id
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
  publishBorrowRequest (user, borrowRequest, next) {
    let that = this

    if (borrowRequest.isPublishing) {
      let getPublishingRequestPromise = new Promise((resolve, reject) => {
        that.getPublishingRequest(user._id, (err, publishingRequests, count) => {
          let hasSelf = false
          logger.debug('count:', count)
          if (count === 0) {
            resolve()
            return
          }

          publishingRequests.forEach(one => {
            if (borrowRequest._id === one._id) {
              hasSelf = true
            }
          })

          if (hasSelf && count > user.maxPublish
            || !hasSelf && count >= user.maxPublish) {
            reject({code:'B008', detail: '登録可能件数：' + user.maxPublish})
          } else {
            resolve()
          }
        })
      })

      getPublishingRequestPromise.then(
        () => {
          that.updateBorrowRequest(user, borrowRequest, next)
        },
        (errReason) => {
          next(errReason)
        }
      )
    } else {
      that.updateBorrowRequest(user, borrowRequest, next)
    }
  }
  getPublishingRequest (contactID, next) {
    let filter = {
      contactID: {$eq: contactID},
      isPublishing: {$eq: true},
      deleted: {$ne: true}
    }

    mongo.find(
      'borrowRequests',
      filter,
      {},
      {_id: -1},
      (error, result, count) => {
        if (error) {
          next(error, null)
        } else {
          next(null, result, count)
        }
      }
    )
  }

  deleteBorrowRequest (user, params, next) {
    let borrowRequest = {
      _id: params._id,
      deleted: true
    }
    this.updateBorrowRequest(user, borrowRequest, next)
  }
}

export default new BorrowRequestService()
