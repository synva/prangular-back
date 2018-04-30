import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'
import utils from './utils'

class TopicService {
  constructor () {
  }
  findAllTopics (params, next) {
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
      'topics',
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
  insertTopic (user, topic, next) {
    let now = new Date()
    now = now.valueOf()
    topic.cdate = now
    topic.cuser = user._id
    topic.contactID = user._id
    topic.udate = now
    topic.uuser = user._id
    mongo.insert(
      'topics',
      topic,
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
  updateTopic (user, topic, next) {
    let id = topic._id
    delete topic._id
    topic.uuser = user._id
    let now = new Date()
    topic.udate = now.valueOf()
    mongo.update(
      'topics',
      {_id: ObjectId(id)},
      {$set: topic},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          topic._id = id
          next(null, topic)
        }
      }
    )
  }
  deleteTopic (user, topic, next) {
    let json = {
      _id: topic._id,
      deleted: true
    }
    this.updateTopic(user, json, next)
  }
}

export default new TopicService()
