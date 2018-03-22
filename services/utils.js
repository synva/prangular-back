import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import logger from './logger.js'
import moment from 'moment'

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
  getDayBeforeYears (year) {
    year = year * -1
    let thisYear = (new Date()).getFullYear()
    let start = new Date('1/1/' + thisYear)
    let defaultStart = moment(start.valueOf())

    return defaultStart.add(year, 'years')
  }
  getBeforeDay (days) {
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    let defaultStart = moment(currentDate.valueOf())
    days = days * -1
    return defaultStart().add(days, 'days')
  }
}

export default new Utils()
