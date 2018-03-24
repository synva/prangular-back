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
      filter.udate = {$gte: dateBeforeWeek.valueOf()}
    }

    if (params.contactID) {
      filter.contactID = {$eq: params.contactID}
    }

    filter.deleted = {$ne: true}
    console.log(filter)// eslint-disable-line

    mongo.find(
      'borrowRequests',
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
  // updateBorrowRequest (user, borrowRequest, next) {
  //   let id = borrowRequest._id
  //   delete borrowRequest._id
  //   borrowRequest.uuser = user._id
  //   let now = new Date()
  //   borrowRequest.udate = now.valueOf()
  //   mongo.update(
  //     'borrowRequests',
  //     {_id: ObjectId(id)},
  //     {$set: borrowRequest},
  //     {multi: false},
  //     (error, result) => {
  //       if (error) {
  //         next(error)
  //       } else {
  //         borrowRequest._id = id
  //         next(null, borrowRequest)
  //       }
  //     }
  //   )
  // }
  updateBorrowRequest (user, borrowRequest, next) {
    let that = this

    let getPublishingRequestPromise = new Promise((resolve, reject) => {
      that.getPublishingRequest(user._id, (err, publishingRequests, count) => {
        let hasSelf = false
        console.log('count:'+count)// eslint-disable-line
        if (count === 0) {
          resolve()
          return
        }

        publishingRequests.forEach(one => {
          if (borrowRequest._id === one._id) {
            hasSelf = true
          }
        })

        console.log('hasSelf:'+hasSelf)// eslint-disable-line
        console.log('user.maxPublish:'+user.maxPublish)// eslint-disable-line
        console.log('count:'+count)// eslint-disable-line
        if (hasSelf && user.maxPublish > count
          || !hasSelf && user.maxPublish >= count) {
          reject({code:'I007', detail: 'max is ' + user.maxPublish})
        } else {
          resolve()
        }
      })
    })
    console.log('borrowRequest.isPublishing:'+borrowRequest.isPublishing)// eslint-disable-line
    if (borrowRequest.isPublishing) {
      getPublishingRequestPromise.then(
        () => {
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
      'borrowRequests',
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

export default new BorrowRequestService()
