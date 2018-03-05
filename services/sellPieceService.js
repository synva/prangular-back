import logger from './logger.js'
import mongo from './mongo.js'

class SellPieceService {
  constructor () {
  }
  findSellPieces (filter, next, paging) {
    filter.deleted = {$ne: true}
    mongo.find(
      'sellPieces',
      filter,
      {sort: {_id: -1}},
      (error, result, count) => {
        if (error) {
          next(error, null)
        } else {
          next(null, result, count)
        }
      },
      paging
    )
  }
  insertSellPiece (user, sellPiece, next) {
    let now = new Date()
    now = now.valueOf()
    sellPiece.cdate = now
    sellPiece.cuser = user._id
    sellPiece.udate = now
    sellPiece.uuser = user._id
    mongo.insert(
      'sellPieces',
      sellPiece,
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
}

export default new SellPieceService()
