import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import moment from 'moment'
import utils from './utils'

class BuyRequestService {
  constructor () {
  }
  findBuyRequests (params, next, page) {
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

    if (params.minute) {
      filter.minute = {$lte: parseInt(params.minute)}
    }

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
    logger.debug(filter)

    mongo.find(
      'buyRequests',
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
  insertBuyRequest (user, buyRequest, next) {
    let now = new Date()
    now = now.valueOf()
    buyRequest.cdate = now
    buyRequest.cuser = user._id
    buyRequest.contactID = user._id
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

  publishBuyRequest (user, buyRequest, next) {
    let that = this

    if (buyRequest.isPublishing) {
      let getPublishingRequestPromise = new Promise((resolve, reject) => {
        that.getPublishingRequest(user._id, (err, publishingRequests, count) => {
          let hasSelf = false

          if (count === 0) {
            resolve()
            return
          }

          publishingRequests.forEach(one => {
            if (buyRequest._id === one._id) {
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
          that.updateBuyRequest(user, buyRequest, next)
        },
        (errReason) => {
          next(errReason)
        }
      )
    } else {
      that.updateBuyRequest(user, buyRequest, next)
    }
  }

  getPublishingRequest (contactID, next) {
    let filter = {
      contactID: {$eq: contactID},
      isPublishing: {$eq: true},
      deleted: {$ne: true}
    }

    mongo.find(
      'buyRequests',
      filter,
      {},
      {_id: -1},
      (error, result, count) => {
        if (error) {
          next(error, null)
        } else {
          logger.debug('result:', result)
          next(null, result, count)
        }
      }
    )
  }

  deleteBuyRequest (user, params, next) {
    let buyRequest = {
      _id: params._id,
      deleted: true
    }
    this.updateBuyRequest(user, buyRequest, next)
  }
}

export default new BuyRequestService()
