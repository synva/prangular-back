import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import utils from './utils'

class RentPieceService {
  constructor () {
  }
  findRentPieces (params, next, page) {
    let filter = this.getFilter(params)
    mongo.find(
      'rentPieces',
      {$and: filter},
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
  findAllRentPieces (params, next) {
    let filter = this.getFilter(params)
    mongo.findAll(
      'rentPieces',
      {$and: filter},
      {},
      {isPublishing: -1, udate: -1},
      (error, results) => {
        if (error) {
          next(error, null)
        } else {
          next(null, results)
        }
      }
    )
  }
  getFilter (params) {
    let filter = []
    if (params._id) {
      filter.push({_id: {$eq: ObjectId(params._id)}})
    }
    if (params.contactID) {
      filter.push({contactID: {$eq: params.contactID}})
    }
    if (params.isPublishing) {
      filter.push({isPublishing: {$eq: true}})
    }
    if (params.stations) {
      let stations = params.stations
      if (!Array.isArray(stations)) {
        stations = [stations]
      }
      filter.push({'stations.station': {$in: stations}})
    }
    if (params.walking) {
      filter.push({'stations.walking': {$lte: parseInt(params.walking)}})
    }
    if (params['layouts[]']) {
      let layouts = params['layouts[]']
      if (!Array.isArray(layouts)) {
        layouts = [layouts]
      }
      filter.push({layout: {$in: layouts}})
    }
    if (params.area) {
      let oneItem = {$or: [
        {exclusiveArea: {$gte: parseFloat(params.area)}},
        {buildingArea: {$gte: parseFloat(params.area)}},
        {landArea: {$gte: parseFloat(params.area)}}
      ]}
      filter.push(oneItem)
    }
    if (params.type) {
      filter.push({type: {$eq: params.type}})
    }
    if (params.structure) {
      filter.push({type: {$eq: params.structure}})
    }
    if (params.age) {
      let dateBeforeyear = utils.yearsBefore(params.age)
      filter.push({built: {$gte: dateBeforeyear.valueOf()}})
    }
    if (params.min) {
      filter.push({price: {$gte: parseInt(params.min)}})
    }
    if (params.max) {
      filter.push({price: {$lte: parseInt(params.max)}})
    }
    if (params.yearsBefore) {
      let dateBefore = utils.yearsBefore(params.yearsBefore)
      filter.push({udate: {$gte: dateBefore.valueOf()}})
    }
    filter.push({deleted: {$ne: true}})

    logger.debug(JSON.stringify({$and: filter}))

    return filter
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
  deleteRentPiece (user, piece, next) {
    let rentPiece = {
      _id: piece._id,
      deleted: true
    }
    this.updateRentPiece(user, rentPiece, next)
  }
}

export default new RentPieceService()
