import conf from 'config'
import logger from './logger.js'
import mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient

class Mongo {
  constructor () {
  }
  init (next) {
    let that = this
    this.db = null

    const str = 'mongodb://' + conf.mongo.user + ':' + conf.mongo.password + '@' + conf.mongo.server + ':' + conf.mongo.port + '/' + conf.mongo.db
    logger.debug(str)

    MongoClient.connect(str).then(client => {
      that.db = client.db(conf.mongo.db)
      next(null)
    }).catch(error => {
      logger.error('mongodb error:', JSON.stringify(error))
      next({code: 'S003', detail: JSON.stringify(error)})
    })
  }
  find (collection_name, criteria, projection, sort, next, page, customLimit) {
    if (typeof(criteria) === 'function') {
      next = criteria
      criteria = {}
      projection = null
      sort = null
    } else if (typeof(projection) === 'function') {
      next = projection
      projection = null
      sort = null
    } else if (typeof(sort) === 'function') {
      next = sort
      sort = null
    }
    let skip = 0
    let limit = customLimit || conf.mongo.limit
    if (page && page > 0) {
      skip = page * limit
    }
    this.db.collection(collection_name, (outer_error, collection) => {
      if (outer_error) {
        logger.error('find connect error:' + JSON.stringify(outer_error))
        next('S003', null)
      } else {
        let cursor = collection.find(criteria)
        if (projection) {
          cursor = cursor.project(projection)
        }
        if (sort) {
          cursor = cursor.sort(sort)
        }
        cursor.count((count_error, count) => {
          if (count_error) {
            logger.error('count error:' + JSON.stringify(count_error))
            next('S003', null)
          } else {
            cursor.skip(skip).limit(limit).toArray((inner_error, list) => {
              if (inner_error) {
                logger.error('find error:' + JSON.stringify(inner_error))
                next('S003', null)
              } else {
                next(null, list, count)
              }
            })
          }
        })
      }
    })
  }
  findAll (collection_name, criteria, projection, sort, next) {
    if (typeof(criteria) === 'function') {
      next = criteria
      criteria = {}
      projection = null
      sort = null
    } else if (typeof(projection) === 'function') {
      next = projection
      projection = null
      sort = null
    } else if (typeof(sort) === 'function') {
      next = sort
      sort = null
    }
    this.db.collection(collection_name, (outer_error, collection) => {
      if (outer_error) {
        logger.error('findAll connect error:', JSON.stringify(outer_error))
        next({code: 'S003', detail: JSON.stringify(outer_error)})
      } else {
        let cursor = collection.find(criteria)
        if (projection) {
          cursor = cursor.project(projection)
        }
        if (sort) {
          cursor = cursor.sort(sort)
        }
        cursor.toArray((inner_error, result) => {
          if (inner_error) {
            logger.error('findAll error:', JSON.stringify(inner_error))
            next({code: 'S003', detail: JSON.stringify(inner_error)})
          } else {
            next(null, result)
          }
        })
      }
    })
  }
  insert (collection_name, document, options, next) {
    this.db.collection(collection_name, (outer_error, collection) => {
      if (outer_error) {
        logger.error('insert connect error:', JSON.stringify(outer_error))
        next({code: 'S003', detail: JSON.stringify(outer_error)})
      } else {
        collection.insert(document, options, (inner_error, result) => {
          if (inner_error) {
            logger.error('insert error:', JSON.stringify(inner_error))
            next({code: 'S003', detail: JSON.stringify(inner_error)})
          } else {
            next(null, result)
          }
        })
      }
    })
  }
  update (collection_name, query, update, options, next) {
    this.db.collection(collection_name, (outer_error, collection) => {
      if (outer_error) {
        logger.error('update connect error:', JSON.stringify(outer_error))
        next({code: 'S003', detail: JSON.stringify(outer_error)})
      } else {
        collection.update(query, update, options, (inner_error, result) => {
          if (inner_error) {
            logger.error('update error:', JSON.stringify(inner_error))
            next({code: 'S003', detail: JSON.stringify(inner_error)})
          } else {
            next(null, result)
          }
        })
      }
    })
  }
  remove (collection_name, query, options, next) {
    this.db.collection(collection_name, (outer_error, collection) => {
      if (outer_error) {
        logger.error('remove connect error:', JSON.stringify(outer_error))
        next({code: 'S003', detail: JSON.stringify(outer_error)})
      } else {
        collection.remove(query, options, (inner_error, result) => {
          if (inner_error) {
            logger.error('remove error:', JSON.stringify(inner_error))
            next({code: 'S003', detail: JSON.stringify(inner_error)})
          } else {
            next(null, result)
          }
        })
      }
    })
  }
}

export default new Mongo()
