import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'

class HomepageService {
  constructor () {
  }
  getUserInfoByDomain (domain, next) {
    mongo.find(
      'users',
      {homepagedomain: {$in: [domain]}},
      {},
      (error, result) => {
        if (error) {
          next(error)
        } else if (result.length <= 0) {
          next({code: 'S002'})
        } else {
          next(null, result[0])
        }
      }
    )
  }
  getHomePageInfoByDomain (domains, next) {
    mongo.find(
      'homepages',
      {domain: {$in: domains}},
      {},
      (error, result, count) => {
        if (error) {
          next(error)
        } else if (result.length <= 0) {
          next({code: 'S002'})
        } else {
          next(null, result, count)
        }
      }
    )
  }
  getHomePageInfoByID (params, next) {
    let filter = {}

    if (params._id) {
      filter._id = ObjectId(params._id)
    }

    mongo.find(
      'homepages',
      filter,
      {},
      (error, result, count) => {
        if (error) {
          next(error)
        } else if (result.length <= 0) {
          next({code: 'S002'})
        } else {
          next(null, result, count)
        }
      }
    )
  }
  insertSellPiece (user, setting, next) {
    let now = new Date()
    now = now.valueOf()
    setting.cdate = now
    setting.cuser = user._id
    setting.contactID = user._id
    setting.udate = now
    setting.uuser = user._id
    mongo.insert(
      'homepages',
      setting,
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
  updateHomePageSetting (user, setting, next) {
    let id = setting._id
    delete setting._id
    setting.uuser = user._id
    let now = new Date()
    setting.udate = now.valueOf()
    mongo.update(
      'homepages',
      {_id: ObjectId(id)},
      {$set: setting},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          setting._id = id
          next(null, setting)
        }
      }
    )
  }
  deleteHomePageSetting (user, setting, next) {
    let homepageSetting = {
      _id: setting._id,
      deleted: true
    }
    this.updateHomePageSetting(user, homepageSetting, next)
  }
}

export default new HomepageService()
