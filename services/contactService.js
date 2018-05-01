import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'

class ContactService {
  constructor () {
    this.contactProjection = {
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
      remark: 1,
      address: 1
    }
  }
  assignContacts (list, next) {
    if (!list || list.length <= 0) return next(null)
    // 業者リスト
    let contactIDs = list.map((one) => {
      return one.contactID
    })
    // 重複を取り除く
    contactIDs = Array.from(new Set(contactIDs))
    mongo.findAll(
      'users',
      {_id: {$in: contactIDs}},
      this.contactProjection,
      {},
      (error, results) => {
        if (error) return next(error)
        list.forEach((one) => {
          results.forEach((contact) => {
            if (one.contactID === contact._id) {
              one.contact = contact
            }
          })
        })
        next(null)
      }
    )
  }
}

export default new ContactService()
