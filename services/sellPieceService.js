import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import moment from 'moment'
import utils from './utils'

class SellPieceService {
  constructor () {
  }
  findSellPieces (params, next, paging) {
    let filterItem = []
    if (params._id) {
      filterItem.push({_id: {$eq: ObjectId(params._id)}})
    }

    if (params.agent) {
      filterItem.push({agent: {$eq: params.agent}})
    }

    // TODO:
    if (params['stations[]']) {
      let stations = params['stations[]']
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

    // TODO:
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
      filterItem.push({built: {$gte: dateBeforeyear.unix() * 1000}})
    }

    if (params.min) {
      filterItem.push({price: {$gte: parseInt(params.min)}})
    }

    if (params.max) {
      filterItem.push({price: {$lte: parseInt(params.max)}})
    }

    if (params.releday) {
      let dateBefore = utils.getDayBeforeYears(params.releday)
      console.log(dateBefore.unix())// eslint-disable-line
      filterItem.push({udate: {$gte: dateBefore.unix() * 1000}})
    }

    filterItem.push({deleted: {$ne: true}})

    let filter = {$and : filterItem}

    console.log(filter)// eslint-disable-line
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
