import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import moment from 'moment'
import utils from './utils'

class SellPieceService {
  constructor () {
  }
  findSellPieces (params, next, page) {
    let filterItem = []
    if (params._id) {
      filterItem.push({_id: {$eq: ObjectId(params._id)}})
    }

    if (params.contactID) {
      filterItem.push({contactID: {$eq: params.contactID}})
    }

    if (params.stations) {
      let stations = params.stations
      if (!Array.isArray(stations)) {
        stations = [stations]
      }

      filterItem.push({'stations.station': {$in: stations}})
    }

    if (params.minute) {
      filterItem.push({'stations.walking': {$lte: parseInt(params.minute)}})
    }

    if (params['layouts[]']) {
      let layouts = params['layouts[]']
      if (!Array.isArray(layouts)) {
        layouts = [layouts]
      }

      filterItem.push({layout: {$in: layouts}})
    }

    if (params.area) {
      let oneItem = {$or: [
        {exclusiveArea: {$gte: parseInt(params.area)}},
        {buildingArea: {$gte: parseInt(params.area)}},
        {landArea: {$gte: parseInt(params.area)}}
      ]}
      filterItem.push(oneItem)
    }

    if (params.type) {
      filterItem.push({type: {$eq: params.type}})
    }

    if (params.structure) {
      filterItem.push({type: {$eq: params.structure}})
    }

    if (params.age) {
      let dateBeforeyear = utils.getDayBeforeYears(params.age)
      filterItem.push({built: {$gte: dateBeforeyear.valueOf()}})
    }

    if (params.min) {
      filterItem.push({price: {$gte: parseInt(params.min)}})
    }

    if (params.max) {
      filterItem.push({price: {$lte: parseInt(params.max)}})
    }

    if (params.releday) {
      let dateBefore = utils.getDayBeforeYears(params.releday)
      filterItem.push({udate: {$gte: dateBefore.valueOf()}})
    }

    filterItem.push({deleted: {$ne: true}})

    let filter = {$and : filterItem}
    logger.debug(JSON.stringify(filter))

    mongo.find(
      'sellPieces',
      filter,
      {sort: {isPublishing: -1, udate: -1}},
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
  insertSellPiece (user, sellPiece, next) {
    let now = new Date()
    now = now.valueOf()
    sellPiece.cdate = now
    sellPiece.cuser = user._id
    sellPiece.contactID = user._id
    sellPiece.udate = now
    sellPiece.uuser = user._id
    mongo.insert(
      'sellPieces',
      sellPiece,
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
  updateSellPiece (user, sellPiece, next) {
    let id = sellPiece._id
    delete sellPiece._id
    sellPiece.uuser = user._id
    let now = new Date()
    sellPiece.udate = now.valueOf()
    mongo.update(
      'sellPieces',
      {_id: ObjectId(id)},
      {$set: sellPiece},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          sellPiece._id = id
          next(null, sellPiece)
        }
      }
    )
  }
  publishSellPiece (user, sellPiece, next) {
    let that = this
    that.getPublishingPiece(user._id, (error, publishingPieces, count) => {
      if (error) {
        next(error)
        return
      }

      let hasSelf = publishingPieces.some(one => {
        return sellPiece._id === one._id
      })

      if (hasSelf && count > user.maxPublish
        || !hasSelf && count >= user.maxPublish) {
        next({code:'B008', detail: '掲載可能件数：' + user.maxPublish})
      } else {
        that.updateSellPiece(user, sellPiece, next)
      }
    })
  }
  getPublishingPiece (contactID, next) {
    let filter = {
      contactID: {$eq: contactID},
      isPublishing: {$eq: true},
      deleted: {$ne: true}
    }
    mongo.find(
      'sellPieces',
      filter,
      {},
      (error, result, count) => {
        if (error) {
          next(error, null)
        } else {
          next(null, result, count)
        }
      }
    )
  }
  deleteSellPiece (user, piece, next) {
    let sellPiece = {
      _id: piece._id,
      deleted: true
    }
    this.updateSellPiece(user, sellPiece, next)
  }
}

export default new SellPieceService()
