import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import utils from './utils'

class RentPieceService {
  constructor () {
  }
  findRentPieces (params, next, paging) {
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
      filter.contactID = params.contactID
    }

    filter.deleted = {$ne: true}
    logger.debug('find rentPieces:', filter)

    mongo.find(
      'rentPieces',
      filter,
      {sort: {isPublishing: -1, udate: -1}},
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
  insertRentPiece (user, rentPiece, next) {
    let now = new Date()
    now = now.valueOf()
    rentPiece.cdate = now
    rentPiece.cuser = user._id
    rentPiece.contactID = user._id
    rentPiece.udate = now
    rentPiece.uuser = user._id
    mongo.insert(
      'rentPieces',
      rentPiece,
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
  updateRentPiece (user, rentPiece, next) {
    let id = rentPiece._id
    delete rentPiece._id
    rentPiece.uuser = user._id
    let now = new Date()
    rentPiece.udate = now.valueOf()
    mongo.update(
      'rentPieces',
      {_id: ObjectId(id)},
      {$set: rentPiece},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          rentPiece._id = id
          next(null, rentPiece)
        }
      }
    )
  }
  publishRentPiece (user, rentPiece, next) {
    let that = this

    if (rentPiece.isPublishing) {
      let getPublishingPiecePromise = new Promise((resolve, reject) => {
        that.getPublishingPiece(user._id, (err, publishingPieces, count) => {
          let hasSelf = false
          logger.debug('count:', count)
          if (count === 0) {
            resolve()
            return
          }

          publishingPieces.forEach(one => {
            if (rentPiece._id === one._id) {
              hasSelf = true
            }
          })

          if (hasSelf && count > user.maxPublish
            || !hasSelf && count >= user.maxPublish) {
            reject({code:'B008', detail: '掲載可能件数：' + user.maxPublish})
          } else {
            resolve()
          }
        })
      })

      getPublishingPiecePromise.then(
        () => {
          that.updateRentPiece(user, rentPiece, next)
        },
        (errReason) => {
          next(errReason)
        }
      )
    } else {
      that.updateRentPiece(user, rentPiece, next)
    }
  }
  getPublishingPiece (contactID, next) {
    let filter = {
      contactID: {$eq: contactID},
      isPublishing: {$eq: true},
      deleted: {$ne: true}
    }

    mongo.find(
      'rentPieces',
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

  deleteRentPiece (user, params, next) {
    let rentPiece = {
      _id: params._id,
      deleted: true
    }
    this.updateRentPiece(user, rentPiece, next)
  }
}

export default new RentPieceService()
