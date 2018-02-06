import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import logger from './logger.js'

class Utils {
  constructor() {
  }
  isFileExist(filename) {
    try {
      fs.statSync(filename)
    }
    catch(err) {
      if (err.code === 'ENOENT') {
        return false
      }
    }
    return true
  }
  writeFile(filename, contents, next) {
    mkdirp(path.dirname(filename), (err) => {
      if (err) {
        logger.error(JSON.stringify(err))
        next({code: 'S002', detail: JSON.stringify(err)})
      }
      else {
        fs.writeFile(filename, contents, 'binary', (err) => {
          if (err) {
            logger.error(JSON.stringify(err))
            next({code: 'S002', detail: JSON.stringify(err)})
          }
          else {
            next(null)
          }
        })
      }
    })
  }
  appendFile(filename, contents, next) {
    mkdirp(path.dirname(filename), (err) => {
      if (err) {
        logger.error(JSON.stringify(err))
        next({code: 'S002', detail: JSON.stringify(err)})
      }
      else {
        fs.appendFile(filename, contents, (err) => {
          if (err) {
            logger.error(JSON.stringify(err))
            next({code: 'S002', detail: JSON.stringify(err)})
          }
          else {
            next(null)
          }
        })
      }
    })
  }
  deleteFile(filename, next) {
    fs.unlink(filename, (err) => {
      if (err) {
        logger.error(JSON.stringify(err))
        next({code: 'S002', detail: JSON.stringify(err)})
      }
      else {
        next(null)
      }
    })
  }
  readFile(filename, next) {
    fs.readFile(filename, 'utf8', (err, text) => {
      if (err) {
        logger.error(JSON.stringify(err))
        next({code: 'S002', detail: JSON.stringify(err)})
      }
      else {
        next(null, text)
      }
    })
  }
  getFileList(filepath, ext, next) {
    let self = this
    fs.readdir(filepath, (err, files) => {
      if (err) {
        logger.error(JSON.stringify(err))
        next({code: 'S002', detail: JSON.stringify(err)})
      }
      else {
        let fileList = []
        let idx = 0
        self.filterFile(filepath, files, idx, ext, fileList, (err) => {
          if (err) {
            next(err, null)
          }
          else {
            next(null, fileList)
          }
        })
      }
    })
  }
  filterFile(filepath, files, idx, ext, fileList, next) {
    let self = this
    if (idx >= files.length) {
      next(null)
      return
    }
    else {
      if (!ext || (ext && path.extname(files[idx]) === ('.' + ext))) {
        let filename = path.join(filepath, path.basename(files[idx]))
        let filestat = fs.statSync(filename)
        let name = path.basename(files[idx], path.extname(files[idx]))
        let udate = filestat.mtime.getTime()
        fileList.push({
          file: filename,
          name: name,
          date: udate
        })
        self.filterFile(filepath, files, idx + 1, ext, fileList, next)
      }
      else {
        self.filterFile(filepath, files, idx + 1, ext, fileList, next)
      }
    }
  }
  execute(cmd, next) {
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
}

export default new Utils()
