import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'

class RentPieceService {
  constructor () {
  }
  findRentPieces (params, next, paging) {
    let filter = {}
    if (params._id) {
      filter._id = ObjectId(params._id)
    }

    if (params.agent) {
      filter.agent = params.agent
    }

    filter.deleted = {$ne: true}
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
      },
      paging
    )
  }
  findRentPieceDetail (params, next, paging) {
    let filter = {}
    if (params.rentPiece) {
      filter._id = ObjectId(params.rentPiece)
    }

    filter.deleted = {$ne: true}
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
      },
      paging
    )
  }
  insertRentPiece (user, rentPiece, next) {
    let now = new Date()
    now = now.valueOf()
    rentPiece.cdate = now
    rentPiece.cuser = user._id
    rentPiece.agent = user._id
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
}

export default new RentPieceService()
