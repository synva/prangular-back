import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'

class UserResourceService {
  constructor () {
  }
  insertUserResources (user, userResources, next) {
    logger.info('new userResource:', userResources)
    let now = new Date()

    userResources.forEach(oneResource => {
      oneResource.cuser = user._id
      oneResource.uuser = user._id
      oneResource.cdate = now.valueOf()
      oneResource.udate = now.valueOf()
    })

    mongo.insert(
      'userResources',
      userResources,
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
  findUserResources (params, next, page) {
    params.deleted = {$ne: true}
    mongo.find(
      'userResources',
      params,
      {sort: {udate: -1}},
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
  updateUserResource (user, userResource, next) {
    let id = userResource._id
    delete userResource._id
    userResource.uuser = user._id
    let now = new Date()
    userResource.udate = now.valueOf()
    mongo.update(
      'userResources',
      {_id: ObjectId(id)},
      {$set: userResource},
      {multi: false},
      (error, result) => {
        if (error) {
          next(error)
        } else {
          userResource._id = id
          next(null, userResource)
        }
      }
    )
  }
  deleteUserResource (user, params, next) {
    let userResource = {
      _id: params._id,
      deleted: true
    }
    this.updateUserResource(user, userResource, next)
  }
}

export default new UserResourceService()



// import express from 'express'
// import url from 'url'
// import logger from './logger.js'
// import utils from './utils.js'


// let router = express.Router()

/**
 * resoure
 */
// getResources (domain, next) {
//   mongo.find(
//     'userResources',
//     {homepagedomain: {$in: [domain]}},
//     {},
//     (error, result) => {
//       if (error) {
//         next(error)
//       } else if (result.length <= 0) {
//         next({code: 'S002'})
//       } else {
//         next(null, result[0])
//       }
//     }
//   )
// }
/**
 * homepage info
 */
// router.get('/getHomePageInfo', (req, res) => {
//   const params = url.parse(req.url, true).query
//   let domain = ''
//   if (typeof params.domain === 'string' || params.domain instanceof String) {
//     domain = params.domain
//   } else {
//     res.json({error: {code: 'B009'}, data: null})
//     return
//   }

//   homepageService.getUserInfoByDomain(domain, (error, userInfo) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       if (userInfo == null) {
//         res.json({error: {code: 'B009'}, data: null})
//         return
//       }
//       homepageService.getHomePageInfoByDomain([domain], (error, homepageInfos) => {
//         if (error) {
//           res.json({error: error, data: null})
//         } else {
//           res.json({error: null, data: homepageInfos[0]})
//         }
//       })
//     }
//   })
// })



/**
 * sellPiece
 */
// router.get('/findSellPieces', (req, res) => {
//   const params = url.parse(req.url, true).query
//   let filter = {}
//   if (params.filter) {
//     if (typeof params.filter === 'string' || params.filter instanceof String) {
//       filter = JSON.parse(params.filter)
//     } else {
//       filter = params.filter
//     }
//   }
//   filter.isPublishing = true
//   let page = utils.parseInt(params.page)

//   logger.info('public findSellPieces:', JSON.stringify(filter))
//   logger.info('page:', page)

//   sellPieceService.findSellPieces(filter, (error, sellPieces, count) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       contactService.assignContacts(sellPieces, (error) => {
//         if (error) {
//           res.json({error: error, data: null})
//         } else {
//           res.json({error: null, data: {datas: sellPieces, count: count}})
//         }
//       })
//     }
//   }, page)
// })

/**
 * rentPiece
 */
// router.get('/findRentPieces', (req, res) => {
//   const params = url.parse(req.url, true).query
//   logger.info('findRentPieces:', params)

//   let filter = {}
//   if (params.filter) {
//     if (typeof params.filter === 'string' || params.filter instanceof String) {
//       filter = JSON.parse(params.filter)
//     } else {
//       filter = params.filter
//     }
//   }

//   let page = utils.parseInt(params.page)

//   logger.info('filter:', filter)
//   rentPieceService.findRentPieces(filter, (error, rentPieces, count) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       contactService.assignContacts(rentPieces, (error) => {
//         if (error) {
//           res.json({error: error, data: null})
//         } else {
//           res.json({error: null, data: {datas: rentPieces, count: count}})
//         }
//       })
//     }
//   }, page)
// })

// module.exports = router
