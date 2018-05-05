import logger from './logger.js'
import mongo from './mongo.js'
import {ObjectId} from 'mongodb'

class ContactService {
  constructor () {
    this.contactProjection = {
      _id: 1,
      avatar: 1,
      nickname: 1,
      position: 1,
      remark: 1,
      homepage: 1,
      homepages: 1,
      company: 1,
      logo: 1,
      icon: 1,
      president: 1,
      create: 1,
      capital: 1,
      license: 1,
      address: 1,
      access: 1,
      phone: 1,
      fax: 1,
      email: 1,
      business: 1,
      holiday: 1,
      latitude: 1,
      longitude: 1,
      services: 1,
      vision: 1,
      shops: 1,
      downloads: 1,
      links: 1
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
