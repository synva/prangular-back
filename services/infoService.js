import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import utils from './utils'

class InfoService {
  constructor () {
  }
  findInfos (params, next) {
    let filter = []
    if (params._id) {
      filter.push({_id: {$eq: ObjectId(params._id)}})
    }
    if (params.user) {
      filter.push({user: {$eq: params.user}})
    }
    filter.push({deleted: {$ne: true}})

    logger.debug(JSON.stringify({$and : filter}))

    mongo.findAll(
      'infos',
      {$and : filter},
      {},
      {cdate: -1},
      (error, results) => {
        if (error) {
          next(error, null)
        } else {
          next(null, results)
        }
      }
    )
  }
  insertInfo (user, info, next) {
    let now = new Date()
    now = now.valueOf()
    info.cdate = now
    info.cuser = user._id
    info.contactID = user._id
    info.udate = now
    info.uuser = user._id
    mongo.insert(
      'infos',
      info,
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
  updateInfo (user, info, next) {
    let id = info._id
    delete info._id
    info.uuser = user._id
    let now = new Date()
    info.udate = now.valueOf()
    mongo.update(
      'infos',
      {_id: ObjectId(id)},
      {$set: info},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          info._id = id
          next(null, info)
        }
      }
    )
  }
  deleteInfo (user, info, next) {
    let json = {
      _id: info._id,
      deleted: true
    }
    this.updateInfo(user, json, next)
  }
}

export default new InfoService()
