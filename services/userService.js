import logger from './logger.js'
import mongo from './mongo.js'

class UserService {
  constructor() {
  }
  recordLogin(user, next) {
    let self = this
    let now = new Date()
    mongo.update(
      'users',
      {_id: user._id},
      {$set: {udate: now.valueOf()}},
      {multi: false},
      (error) => {
        if (error) {
          next(error)
        }
        else {
          self.getUser(user, (error, user) => {
            next(error, user)
          })
        }
      }
    )
  }
  insertUser(user, next) {
    logger.info('new user:', user._id)
    mongo.find(
      'users',
      {_id: user._id},
      {},
      (error, result) => {
        if (error) {
          next(error)
        }
        else {
          if (result.length <= 0) {
            user.cuser = user._id
            user.uuser = user._id
            let now = new Date()
            user.cdate = now.valueOf()
            user.udate = now.valueOf()
            mongo.insert(
              'users',
              user,
              {},
              (error, inserted) => {
                if (error) {
                  next(error)
                }
                else {
                  next(null, inserted.ops[0])
                }
              }
            )
          }
          else {
            next({code: 'B003'})
          }
        }
      }
    )
  }
  getUser(user, next) {
    mongo.find(
      'users',
      {_id: user._id, password: user.password},
      {},
      (error, result) => {
        if (error) {
          next(error)
        }
        else if (result.length <= 0) {
          next({code: 'S002'})
        }
        else {
          next(null, result[0])
        }
      }
    )
  }
  authenticate(_id, password, next) {
    mongo.find(
      'users',
      {_id: _id, password: password},
      {},
      (error, result) => {
        if (error) {
          next(error)
        }
        else if (result.length <= 0) {
          next('authenticate error!')
        }
        else {
          next(null, result[0])
        }
      }
    )
  }
}

export default new UserService()
