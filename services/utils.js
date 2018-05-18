import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import conf from 'config'
import logger from './logger.js'
import moment from 'moment'
import nodemailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'

class Utils {
  constructor () {
  }
  isFileExist (filename) {
    try {
      fs.statSync(filename)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false
      }
    }
    return true
  }
  writeFile (filename, contents, next) {
    mkdirp(path.dirname(filename), (error) => {
      if (error) {
        logger.error(JSON.stringify(error))
        next({code: 'S002', detail: JSON.stringify(error)})
      } else {
        fs.writeFile(filename, contents, 'binary', (error) => {
          if (error) {
            logger.error(JSON.stringify(error))
            next({code: 'S002', detail: JSON.stringify(error)})
          } else {
            next(null)
          }
        })
      }
    })
  }
  appendFile (filename, contents, next) {
    mkdirp(path.dirname(filename), (error) => {
      if (error) {
        logger.error(JSON.stringify(error))
        next({code: 'S002', detail: JSON.stringify(error)})
      } else {
        fs.appendFile(filename, contents, (error) => {
          if (error) {
            logger.error(JSON.stringify(error))
            next({code: 'S002', detail: JSON.stringify(error)})
          } else {
            next(null)
          }
        })
      }
    })
  }
  deleteFile (filename, next) {
    fs.unlink(filename, (error) => {
      if (error) {
        logger.error(JSON.stringify(error))
        next({code: 'S002', detail: JSON.stringify(error)})
      } else {
        next(null)
      }
    })
  }
  readFile (filename, next) {
    fs.readFile(filename, 'utf8', (error, text) => {
      if (error) {
        logger.error(JSON.stringify(error))
        next({code: 'S002', detail: JSON.stringify(error)})
      } else {
        next(null, text)
      }
    })
  }
  execute (cmd, next) {
    let exec = require('child_process').exec
    exec(cmd, (error, stdout) => {
      if (!error) {
        let pyresult = stdout.replace(/\\n/g, '\n')
        next(null, pyresult)
      } else {
        logger.error(error)
        next({code: 'S002', detail: JSON.stringify(error)})
      }
    })
  }
  yearsBefore (year) {
    year = year * -1
    let thisYear = (new Date()).getFullYear()
    let start = new Date('1/1/' + thisYear)
    let defaultStart = moment(start.valueOf())

    return defaultStart.add(year, 'years')
  }
  daysBefore (days) {
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    let defaultStart = moment(currentDate.valueOf())
    days = days * -1
    return defaultStart().add(days, 'days')
  }
  parseInt (str) {
    let i = parseInt(str)
    if (isNaN(i)) return null
    return i
  }
  getDomain (req) {
    let domain = null
    if (req.headers.origin) {
      domain = req.headers.origin.toLowerCase().split('//')[1]
    } else if (req.headers.host) {
      domain = req.headers.host.toLowerCase()
    } else {
      logger.error('miss domain:', JSON.stringify(req.headers))
    }
    return domain
  }
  validateEmail (email) {
    let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }
  /**
   * send mail without callback
   */
  sendMail (mailOptions) {
    let transporter = nodemailer.createTransport(
      smtpTransport(conf.smtp)
    )
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        logger.error(error)
      }
    })
  }
}

export default new Utils()
