import express from 'express'
import url from 'url'
import conf from 'config'
import logger from '../services/logger.js'
import utils from '../services/utils.js'

import fileService from '../services/fileService.js'
import sellPieceService from '../services/sellPieceService.js'
import rentPieceService from '../services/rentPieceService.js'
// import buyRequestService from '../services/buyRequestService.js'
// import borrowRequestService from '../services/borrowRequestService.js'
import userService from '../services/userService.js'
import homepageService from '../services/homepageService.js'
import inquiryService from '../services/inquiryService.js'
import topicService from '../services/topicService.js'
// import resourceService from '../services/resourceService.js'

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
router.post('/updateUser', (req, res) => {
  logger.info('updateUser:', req.body)
  userService.updateUser(req.session.passport.user, req.body, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: user})
    }
  })
})

/**
 * sellPiece
 */
router.put('/insertSellPiece', (req, res) => {
  logger.info('insertSellPiece:', req.body)
  Promise.all([
    new Promise((resolve, reject) => {
      userService.getUser(req.session.passport.user, (error, user) => {
        if (error) return reject(error)
        resolve(user)
      })
    }),
    new Promise((resolve, reject) => {
      sellPieceService.findSellPieces({contactID: req.session.passport.user._id}, (error, sellPieces, count) => {
        if (error) return reject(error)
        resolve(count)
      })
    })
  ]).then((values) => {
    let user = values[0]
    let count = values[1]
    logger.debug('max sell count:', user.maxSell)
    logger.debug('current count:', count)
    if (count >= user.maxSell) return res.json({error: {code: 'B008', detail: '登録可能件数：' + user.maxSell}, data: null})
    sellPieceService.insertSellPiece(user, req.body, (error, sellPiece) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: sellPiece})
      }
    })
  }, (reason) => {
    res.json({error: reason, data: null})
  })
})
router.get('/findSellPieces', (req, res) => {
  const params = url.parse(req.url, true).query
  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }
  filter.contactID = req.session.passport.user._id
  let page = utils.parseInt(params.page)

  logger.info('private findSellPieces:', JSON.stringify(filter))
  logger.info('page:', page)

  sellPieceService.findSellPieces(filter, (error, sellPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {sellPieces: sellPieces, count: count}})
    }
  }, page)
})
router.post('/updateSellPiece', (req, res) => {
  logger.info('updateSellPiece:', req.body)
  sellPieceService.updateSellPiece(req.session.passport.user, req.body, (error, sellPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: sellPiece})
    }
  })
})
router.post('/deleteSellPiece', (req, res) => {
  logger.info('deleteSellPiece:', req.body)
  sellPieceService.deleteSellPiece(req.session.passport.user, req.body, (error, sellPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: sellPiece})
    }
  })
})

/**
 * rentPiece
 */
router.put('/insertRentPiece', (req, res) => {
  logger.info('insertRentPiece:', req.body)
  Promise.all([
    new Promise((resolve, reject) => {
      userService.getUser(req.session.passport.user, (error, user) => {
        if (error) return reject(error)
        resolve(user)
      })
    }),
    new Promise((resolve, reject) => {
      rentPieceService.findRentPieces({contactID: req.session.passport.user._id}, (error, rentPieces, count) => {
        if (error) return reject(error)
        resolve(count)
      })
    })
  ]).then((values) => {
    let user = values[0]
    let count = values[1]
    logger.debug('max sell count:', user.maxRent)
    logger.debug('current count:', count)
    if (count >= user.maxRent) return res.json({error: {code: 'B008', detail: '登録可能件数：' + user.maxRent}, data: null})
    rentPieceService.insertRentPiece(user, req.body, (error, rentPiece) => {
      if (error) {
        res.json({error: error, data: null})
      } else {
        res.json({error: null, data: rentPiece})
      }
    })
  }, (reason) => {
    res.json({error: reason, data: null})
  })
})
router.get('/findRentPieces', (req, res) => {
  const params = url.parse(req.url, true).query
  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }
  filter.contactID = req.session.passport.user._id
  let page = utils.parseInt(params.page)

  logger.info('private findRentPieces:', JSON.stringify(filter))
  logger.info('page:', page)

  rentPieceService.findRentPieces(filter, (error, rentPieces, count) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: {rentPieces: rentPieces, count: count}})
    }
  }, page)
})
router.post('/updateRentPiece', (req, res) => {
  logger.info('updateRentPiece:', req.body)
  rentPieceService.updateRentPiece(req.session.passport.user, req.body, (error, rentPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: rentPiece})
    }
  })
})
router.post('/deleteRentPiece', (req, res) => {
  logger.info('deleteRentPiece:', req.body)
  rentPieceService.deleteRentPiece(req.session.passport.user, req.body, (error, rentPiece) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: rentPiece})
    }
  })
})

/**
 * buyRequest
 */
// router.put('/insertBuyRequest', (req, res) => {
//   logger.info('insertBuyRequest:', req.body)
//   userService.getUser(req.session.passport.user, (error, user) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       buyRequestService.insertBuyRequest(user, req.body, (error, buyRequest) => {
//         if (error) {
//           res.json({error: error, data: null})
//         } else {
//           res.json({error: null, data: buyRequest})
//         }
//       })
//     }
//   })
// })

// router.get('/findBuyRequests', (req, res) => {
//   const params = url.parse(req.url, true).query

//   let filter = {}
//   if (params.filter) {
//     if (typeof params.filter === 'string' || params.filter instanceof String) {
//       filter = JSON.parse(params.filter)
//     } else {
//       filter = params.filter
//     }
//   }

//   let page = utils.parseInt(params.page)

//   filter.contactID = req.session.passport.user._id
//   logger.info('findBuyRequests:', filter)
//   logger.info('page:', page)

//   buyRequestService.findBuyRequests(filter, (error, buyRequests, count) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {datas: buyRequests, count: count}})
//     }
//   }, page)
// })

// router.post('/updateBuyRequest', (req, res) => {
//   logger.info('updateBuyRequest:', req.body)

//   buyRequestService.updateBuyRequest(req.session.passport.user, req.body, (error, buyRequest) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {buyRequest: buyRequest}})
//     }
//   })
// })

// router.post('/publishBuyRequest', (req, res) => {
//   logger.info('publishBuyRequest:', req.body)

//   userService.getUser(req.session.passport.user, (error, user) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       buyRequestService.publishBuyRequest(user, req.body, (error, buyRequest) => {
//         if (error) {
//           res.json({error: error, data: null})
//         } else {
//           res.json({error: null, data: {buyRequest: buyRequest}})
//         }
//       })
//     }
//   })
// })
// router.post('/unPublishBuyRequest', (req, res) => {
//   logger.info('unPublishBuyRequest:', req.body)

//   buyRequestService.publishBuyRequest(req.session.passport.user, req.body, (error, buyRequest) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {buyRequest: buyRequest}})
//     }
//   })
// })
// router.post('/deleteBuyRequest', (req, res) => {
//   logger.info('deleteBuyRequest:', req.body)
//   buyRequestService.deleteBuyRequest(req.session.passport.user, req.body, (error, buyRequest) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {buyRequest: buyRequest}})
//     }
//   })
// })

/**
 * borrowRequest
 */
// router.put('/insertBorrowRequest', (req, res) => {
//   logger.info('insertBorrowRequest:', req.body)
//   borrowRequestService.insertBorrowRequest(req.session.passport.user, req.body, (error, borrowRequest) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: borrowRequest})
//     }
//   })
// })

// router.get('/findBorrowRequests', (req, res) => {
//   const params = url.parse(req.url, true).query

//   let filter = {}
//   if (params.filter) {
//     if (typeof params.filter === 'string' || params.filter instanceof String) {
//       filter = JSON.parse(params.filter)
//     } else {
//       filter = params.filter
//     }
//   }

//   let page = utils.parseInt(params.page)

//   filter.contactID = req.session.passport.user._id

//   logger.info('findBorrowRequests:', params)
//   logger.info('page:', page)

//   borrowRequestService.findBorrowRequests(filter, (error, borrowRequests, count) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {datas: borrowRequests, count: count}})
//     }
//   }, page)
// })
// router.post('/updateBorrowRequest', (req, res) => {
//   logger.info('updateBorrowRequest:', req.body)
//   userService.getUser(req.session.passport.user, (error, user) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       borrowRequestService.updateBorrowRequest(user, req.body, (error, borrowRequest) => {
//         if (error) {
//           res.json({error: error, data: null})
//         } else {
//           res.json({error: null, data: {borrowRequest: borrowRequest}})
//         }
//       })
//     }
//   })
// })
// router.post('/publishBorrowRequest', (req, res) => {
//   logger.info('publishBorrowRequest:', req.body)
//   userService.getUser(req.session.passport.user, (error, user) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       borrowRequestService.publishBorrowRequest(user, req.body, (error, borrowRequest) => {
//         if (error) {
//           res.json({error: error, data: null})
//         } else {
//           res.json({error: null, data: {borrowRequest: borrowRequest}})
//         }
//       })
//     }
//   })
// })
// router.post('/unPublishBorrowRequest', (req, res) => {
//   logger.info('unPublishBorrowRequest:', req.body)
//   borrowRequestService.publishBorrowRequest(req.session.passport.user, req.body, (error, borrowRequest) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {borrowRequest: borrowRequest}})
//     }
//   })
// })
// router.post('/deleteBorrowRequest', (req, res) => {
//   logger.info('deleteBorrowRequest:', req.body)
//   borrowRequestService.deleteBorrowRequest(req.session.passport.user, req.body, (error, borrowRequest) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {borrowRequest: borrowRequest}})
//     }
//   })
// })

/*
* HomePage
*/
router.get('/findHomepages', (req, res) => {
  logger.info('findHomepages')
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      if (!user.homepages || user.homepages.length <= 0) {
        res.json({error: null, data: []})
      } else {
        homepageService.getHomepages(user.homepages, (error, homepages) => {
          if (error) {
            res.json({error: error, data: null})
          } else {
            res.json({error: null, data: homepages})
          }
        })
      }
    }
  })
})
router.put('/insertHomepage', (req, res) => {
  logger.info('insertHomepage:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      homepageService.insertHomepage(user, req.body, (error, homepage) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          res.json({error: null, data: homepage})
        }
      })
    }
  })
})
router.post('/updateHomepage', (req, res) => {
  logger.info('updateHomepage:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      const homepage = req.body
      homepageService.getHomepage(homepage._id, (error, origin_homepage) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          homepageService.updateHomepage(user, homepage, (error, updated) => {
            if (error) {
              res.json({error: error, data: null})
            } else {
              if (origin_homepage.domain !== homepage.domain) {
                for (let i in user.homepages) {
                  if (user.homepages[i] === origin_homepage.domain) {
                    user.homepages[i] = homepage.domain
                    break
                  }
                }
                userService.updateUser(user, user, (error, updatedUser) => {
                  if (error) {
                    res.json({error: error, data: null})
                  } else {
                    res.json({error: null, data: updated})
                  }
                })
              } else {
                res.json({error: null, data: updated})
              }
            }
          })
        }
      })
    }
  })
})
router.post('/deleteHomepage', (req, res) => {
  logger.info('deleteHomepage:', req.body)
  userService.getUser(req.session.passport.user, (error, user) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      const homepage = req.body
      homepageService.getHomepage(homepage._id, (error, origin_homepage) => {
        if (error) {
          res.json({error: error, data: null})
        } else {
          homepageService.deleteHomepage(user, req.body, (error, updated) => {
            if (error) {
              res.json({error: error, data: null})
            } else {
              for (let i in user.homepages) {
                if (user.homepages[i] === origin_homepage.domain) {
                  user.homepages.splice(i, 1)
                  break
                }
              }
              userService.updateUser(user, user, (error, updatedUser) => {
                if (error) {
                  res.json({error: error, data: null})
                } else {
                  res.json({error: null, data: updated})
                }
              })
            }
          })
        }
      })
    }
  })
})

/**
 * inquiry
 */
router.get('/findInquiries', (req, res) => {
  const params = url.parse(req.url, true).query
  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }
  filter.user = req.session.passport.user._id

  logger.info('private findInquiries:', JSON.stringify(filter))

  inquiryService.findAllInquiries(filter, (error, inquiries) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: inquiries})
    }
  })
})
router.post('/updateInquiry', (req, res) => {
  logger.info('updateInquiry:', req.body)
  inquiryService.updateInquiry(req.session.passport.user, req.body, (error, inquiry) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: inquiry})
    }
  })
})

/**
 * topic
 */
router.get('/findTopics', (req, res) => {
  const params = url.parse(req.url, true).query
  let filter = {}
  if (params.filter) {
    if (typeof params.filter === 'string' || params.filter instanceof String) {
      filter = JSON.parse(params.filter)
    } else {
      filter = params.filter
    }
  }
  filter.user = req.session.passport.user._id

  logger.info('private findTopics:', JSON.stringify(filter))

  topicService.findAllTopics(filter, (error, topics) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: topics})
    }
  })
})
router.put('/insertTopic', (req, res) => {
  logger.info('insertTopic:', req.body)
  topicService.insertTopic(req.session.passport.user, req.body, (error, topic) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: topic})
    }
  })
})
router.post('/updateTopic', (req, res) => {
  logger.info('updateTopic:', req.body)
  topicService.updateTopic(req.session.passport.user, req.body, (error, topic) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: topic})
    }
  })
})
router.post('/deleteTopic', (req, res) => {
  logger.info('deleteTopic:', req.body)
  topicService.deleteTopic(req.session.passport.user, req.body, (error, topic) => {
    if (error) {
      res.json({error: error, data: null})
    } else {
      res.json({error: null, data: topic})
    }
  })
})

/*
* Resource
*/
// router.put('/insertResources', (req, res) => {
//   logger.info('insertBorrowRequest:', req.body)
//   resourceService.insertResources(req.session.passport.user, req.body, (error, borrowRequest) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: borrowRequest})
//     }
//   })
// })

// router.get('/findResources', (req, res) => {
//   const params = url.parse(req.url, true).query

//   let filter = {}
//   if (params.filter) {
//     if (typeof params.filter === 'string' || params.filter instanceof String) {
//       filter = JSON.parse(params.filter)
//     } else {
//       filter = params.filter
//     }
//   }

//   let page = utils.parseInt(params.page)

//   filter.cuser = req.session.passport.user._id

//   logger.info('findResources:', filter)
//   logger.info('page:', page)

//   resourceService.findResources(filter, (error, userResources, count) => {
//     logger.debug('error:', error)
//     logger.debug('userResources:', userResources)
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: {datas: userResources, count: count}})
//     }
//   }, page)
// })
// router.post('/deleteResources', (req, res) => {
//   logger.info('deleteResources:', req.body)
//   resourceService.deleteResource(req.session.passport.user, req.body, (error, userResource) => {
//     if (error) {
//       res.json({error: error, data: null})
//     } else {
//       res.json({error: null, data: userResource})
//     }
//   })
// })

module.exports = router
