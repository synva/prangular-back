import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'

class HomepageService {
  constructor () {
    this.userProjection = {
      _id: 1,
      avatar: 1,
      logo: 1,
      nickname: 1,
      company: 1,
      homepage: 1,
      license: 1,
      position: 1,
      phone: 1,
      fax: 1,
      email: 1,
      // TODO: error with this column, why?
      // comment: 1,
      address: 1,
      homepages: 1
    }
  }
  getUser (domain, next) {
    mongo.find(
      'users',
      {homepages: {$in: [domain]}},
      this.userProjection,
      (error, result) => {
        if (error) {
          next(error)
        } else if (result.length <= 0) {
          next({code: 'B001'})
        } else {
          next(null, result[0])
        }
      }
    )
  }
  getHomepages (domains, next) {
    mongo.findAll(
      'homepages',
      {domain: {$in: domains}},
      {},
      (error, results) => {
        logger.info('results:', results)
        if (error) {
          next(error)
        } else if (results.length <= 0) {
          next({code: 'B001'})
        } else {
          next(null, results)
        }
      }
    )
  }
  getHomepage (id, next) {
    mongo.find(
      'homepages',
      {_id: ObjectId(id)},
      {},
      (error, result, count) => {
        if (error) {
          next(error)
        } else if (result.length <= 0) {
          next({code: 'B001'})
        } else {
          next(null, result[0], count)
        }
      }
    )
  }
  insertHomepage (user, config, next) {
    let now = new Date()
    now = now.valueOf()
    config.cdate = now
    config.cuser = user._id
    config.contactID = user._id
    config.udate = now
    config.uuser = user._id
    mongo.insert(
      'homepages',
      config,
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
  updateHomepage (user, config, next) {
    let id = config._id
    delete config._id
    config.uuser = user._id
    let now = new Date()
    config.udate = now.valueOf()
    mongo.update(
      'homepages',
      {_id: ObjectId(id)},
      {$set: config},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          config._id = id
          next(null, config)
        }
      }
    )
  }
  deleteHomePageSetting (user, config, next) {
    let homepageSetting = {
      _id: config._id,
      deleted: true
    }
    this.updateHomePageSetting(user, homepageSetting, next)
  }
}

export default new HomepageService()
