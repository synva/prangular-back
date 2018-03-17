import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'

class SellPieceService {
  constructor () {
  }
  findSellPieces (params, next, paging) {
    let filter = {}
    if (params._id) {
      filter._id = ObjectId(params._id)
    }

    if (params.agent) {
      filter.agent = params.agent
    }

    filter.deleted = {$ne: true}
    mongo.find(
      'sellPieces',
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
  findSellPieceDetail (params, next, paging) {
    let filter = {}
    if (params.sellPiece) {
      filter._id = ObjectId(params.sellPiece)
    }

    filter.deleted = {$ne: true}
    mongo.find(
      'sellPieces',
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
  insertSellPiece (user, sellPiece, next) {
    let now = new Date()
    now = now.valueOf()
    sellPiece.cdate = now
    sellPiece.cuser = user._id
    sellPiece.agent = user._id
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
}

export default new SellPieceService()
