import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import utils from './utils'

class SellPieceService {
  constructor () {
  }
  findSellPieces (params, sort, next, page) {
    let filter = this.getFilter(params)
    mongo.find(
      'sellPieces',
      {$and: filter},
      {},
      sort,
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
  findAllSellPieces (params, sort, next) {
    let filter = this.getFilter(params)
    mongo.findAll(
      'sellPieces',
      {$and: filter},
      {},
      sort,
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
  insertSellPieces (user, sellPieces, next) {
    let now = new Date()
    now = now.valueOf()
    sellPieces.forEach(sellPiece => {
      sellPiece.cdate = now
      sellPiece.cuser = user._id
      sellPiece.contactID = user._id
      sellPiece.udate = now
      sellPiece.uuser = user._id
    })
    mongo.insert(
      'sellPieces',
      sellPieces,
      {},
      (error, results) => {
        if (error) {
          next(error, null)
        } else {
          let inserted = results
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
  deleteSellPiece (user, piece, next) {
    let sellPiece = {
      _id: piece._id,
      deleted: true
    }
    this.updateSellPiece(user, sellPiece, next)
  }
}

export default new SellPieceService()
