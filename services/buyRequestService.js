import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import moment from 'moment'
import utils from './utils'

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

    if (params.releday) {
      let dateBefore = utils.getDayBeforeYears(params.releday)
      filter.udate = {$gte: dateBefore.valueOf()}
    }

    if (params.contactID) {
      filter.contactID = {$eq: params.contactID}
    }

    filter.deleted = {$ne: true}
    console.log(filter)// eslint-disable-line

    mongo.find(
      'buyRequests',
      filter,
      {sort: {isPublishing: -1, _id: -1}},
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
    let that = this

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

        if (hasSelf && user.maxPublish > count
          || !hasSelf && user.maxPublish >= count) {
          reject({code:'I007', detail: 'max is ' + user.maxPublish})
        } else {
          resolve()
        }
      })
    })

    if (buyRequest.isPublishing) {
      getPublishingRequestPromise.then(
        () => {
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
        },
        (errReason) => {
          next(errReason)
        }
      )
    }
  }
  getPublishingRequest (contactID, next) {
    let filter = {
      contactID: {$eq: contactID},
      isPublishing: {$eq: 1},
      deleted: {$ne: true}
    }

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
      }
    )
  }
}

export default new BuyRequestService()
