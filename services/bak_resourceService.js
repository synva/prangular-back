import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'

class ResourceService {
  constructor () {
  }
  insertResources (user, resources, next) {
    logger.info('new resource:', resources)
    let now = new Date()

    resources.forEach(oneResource => {
      oneResource.cuser = user._id
      oneResource.uuser = user._id
      oneResource.cdate = now.valueOf()
      oneResource.udate = now.valueOf()
    })

    mongo.insert(
      'resources',
      resources,
      {},
      (error, inserted) => {
        if (error) {
          next(error)
        } else {
          logger.debug(inserted)
          next(null, inserted.ops[0])
        }
      }
    )

  }
  findResources (params, next, page) {
    params.deleted = {$ne: true}
    mongo.find(
      'resources',
      params,
      {},
      {udate: -1},
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
  updateResource (user, resource, next) {
    let id = resource._id
    delete resource._id
    resource.uuser = user._id
    let now = new Date()
    resource.udate = now.valueOf()
    mongo.update(
      'resources',
      {_id: ObjectId(id)},
      {$set: resource},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          resource._id = id
          next(null, resource)
        }
      }
    )
  }
  deleteResource (user, params, next) {
    let resource = {
      _id: params._id,
      deleted: true
    }
    this.updateResource(user, resource, next)
  }
}

export default new ResourceService()
