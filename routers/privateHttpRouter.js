import express from 'express'
import url from 'url'
import conf from 'config'
import logger from '../services/logger.js'
import utils from '../services/utils.js'

import fileService from '../services/fileService.js'

let router = express.Router()

/**
 * upload
 */
router.post('/uploadFiles', (req, res) => {
  logger.info('uploadFiles')
  fileService.uploadFiles(req, (error, list) => {
    if (!error) {
      logger.info('upload end:', JSON.stringify(list))
      let files = []
      let root = conf.storagy.mode === 'local' ? '/static/upload/' : '/static/s3/upload/'
      list.forEach(one => {
        files.push({
          file: root + one.folder + '/' + one.name,
          thumbnail: one.thumbnail ? (root + one.folder + '/' + one.thumbnail) : null,
          folder: one.folder,
          name: one.name,
          type: one.type,
          size: one.size
        })
      })
      res.json({error: null, data: files})
    } else {
      res.json({error: error, data: null})
    }
  })
})

/**
 * user
 */
// router.post('/updateUser', (req, res) => {
//   logger.info('updateUser:', req.body)
//   userService.updateUser(req.session.passport.user, req.body, (error, user) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: user})
//     }
//   })
// })

/**
 * sellPiece
 */
// router.put('/insertSellPiece', (req, res) => {
//   logger.info('insertSellPiece:', req.body)
//   Promise.all([
//     new Promise((resolve, reject) => {
//       userService.getUser(req.session.passport.user, (error, user) => {
//         if (error) return reject(error)
//         resolve(user)
//       })
//     }),
//     new Promise((resolve, reject) => {
//       sellPieceService.findSellPieces({contactID: req.session.passport.user._id}, {}, (error, sellPieces, count) => {
//         if (error) return reject(error)
//         resolve(count)
//       })
//     })
//   ]).then((values) => {
//     let user = values[0]
//     let count = values[1]
//     logger.debug('max sell count:', user.maxSell)
//     logger.debug('current count:', count)
//     if (count >= user.maxSell) return res.json({error: {code: 'B008', detail: '登録可能な売買物件件数：' + user.maxSell}, data: null})
//     sellPieceService.insertSellPiece(user, req.body, (error, sellPiece) => {
//       if (error) {
//         res.json({error: error, data: null})
//       } else {
//         res.json({error: null, data: sellPiece})
//       }
//     })
//   }, (reason) => {
//     res.json({error: reason, data: null})
//   })
// })
// router.get('/findAllSellPieces', (req, res) => {
//   let filter = {}
//   filter.contactID = req.session.passport.user._id
//   let sort = {}
//   sort.udate = -1
//   logger.info('private findAllSellPieces:', JSON.stringify(filter))
//   logger.info('sort:', JSON.stringify(sort))

//   sellPieceService.findAllSellPieces(filter, sort, (error, sellPieces) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {sellPieces: sellPieces}})
//     }
//   })
// })
// router.post('/updateSellPiece', (req, res) => {
//   logger.info('updateSellPiece:', req.body)
//   sellPieceService.updateSellPiece(req.session.passport.user, req.body, (error, sellPiece) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: sellPiece})
//     }
//   })
// })
// router.post('/deleteSellPiece', (req, res) => {
//   logger.info('deleteSellPiece:', req.body)
//   sellPieceService.deleteSellPiece(req.session.passport.user, req.body, (error, sellPiece) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: sellPiece})
//     }
//   })
// })

module.exports = router
