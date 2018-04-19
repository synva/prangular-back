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
      {udate: -1},
      (error, results) => {
        if (error) {
          next(error)
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
      (error, results) => {
        if (error) {
          next(error)
        } else if (results.length <= 0) {
          next({code: 'S002'})
        } else {
          next(null, results[0])
        }
      }
    )
  }
  insertHomepage (user, homepage, next) {
    let now = new Date()
    now = now.valueOf()
    homepage.cdate = now
    homepage.cuser = user._id
    homepage.udate = now
    homepage.uuser = user._id
    mongo.insert(
      'homepages',
      homepage,
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
  updateHomepage (user, homepage, next) {
    let id = homepage._id
    delete homepage._id
    homepage.uuser = user._id
    let now = new Date()
    homepage.udate = now.valueOf()
    mongo.update(
      'homepages',
      {_id: ObjectId(id)},
      {$set: homepage},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          homepage._id = id
          next(null, homepage)
        }
      }
    )
  }
  deleteHomepage (user, homepage, next) {
    let deleted = {
      _id: homepage._id,
      deleted: true
    }
    this.updateHomepage(user, deleted, next)
  }
}

export default new HomepageService()
