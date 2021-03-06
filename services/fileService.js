import logger from './logger.js'
import conf from 'config'
import utils from './utils.js'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import uuid from 'uuid'
import formidable from 'formidable'
import AWS from 'aws-sdk'
let s3 = new AWS.S3({region: conf.storagy.region})
import os from 'os'
let sharp = null
if (os.arch() === 'x64') {
  sharp = require('sharp')
}

class FileService {
  constructor () {
  }
  uploadFiles (req, next) {
    let that = this
    let localFileList = []
    let form = new formidable.IncomingForm()
    let params = {}
    form.multiples = false

    form.on('field', (field, value) => {
      params[field] = value
    })

    form.on('fileBegin', (field, file) => {
      let folder = uuid.v4()
      if (params.subFolder) {
        file.path = path.join(__dirname, '..', 'upload', params.subFolder, folder, file.name)
        try {
          mkdirp.sync(path.join(__dirname, '..', 'upload', params.subFolder, folder))
        } catch (error) {
          logger.error(JSON.stringify(error))
          next({code: 'S002', detail: JSON.stringify(error)})
          return
        }
        localFileList.push({
          fullname: file.path,
          folder: path.join(params.subFolder, folder),
          name: file.name,
          extname: path.extname(file.path).toUpperCase().replace('.', ''),
          type: file.type
        })
      } else {
        file.path = path.join(__dirname, '..', 'upload', folder, file.name)
        try {
          mkdirp.sync(path.join(__dirname, '..', 'upload', folder))
        } catch (error) {
          logger.error(JSON.stringify(error))
          next({code: 'S002', detail: JSON.stringify(error)})
          return
        }
        localFileList.push({
          fullname: file.path,
          folder: folder,
          name: file.name,
          extname: path.extname(file.path).toUpperCase().replace('.', ''),
          type: file.type
        })
      }
    })

    form.on('file', (field, file) => {
      for (let i = 0; i < localFileList.length; i++) {
        if (localFileList[i].fullname === file.path) {
          localFileList[i].size = file.size
          break
        }
      }
    })

    form.on('end', () => {
      logger.info('params:', JSON.stringify(params))
      let fileList = []
      that.thumbnail(localFileList, 0, fileList, params.type, (error) => {
        if (error) {
          next(error)
        } else {
          that.putToS3(fileList, (error) => {
            if (error) {
              next(error)
            } else {
              next(null, fileList)
            }
          })
        }
      })
    })

    form.on('error', (error) => {
      logger.error(error)
      next({code: 'S006', detail: JSON.stringify(error)})
    })

    form.parse(req)
  }
  thumbnail (localFileList, idx, fileList, type, next) {
    let that = this
    if (idx > localFileList.length - 1) {
      next(null)
      return
    }
    let needThumbnail = false
    for (let i = 0; i < conf.image.length; i++) {
      if (conf.image[i] === localFileList[idx].extname) {
        needThumbnail = true
        break
      }
    }
    if (type === 'none') needThumbnail = false
    if (needThumbnail) {
      if (os.arch() === 'x64') {
        let thumbnailName = path.basename(localFileList[idx].name, path.extname(localFileList[idx].name)) + '_thumbnail'
        if (type === 'icon') thumbnailName += '.ico'
        else thumbnailName += '.png'
        let thumbnailFullname = path.join(__dirname, '..', 'upload', localFileList[idx].folder, thumbnailName)
        sharp(localFileList[idx].fullname)
          .rotate()
          .resize(500)
          .limitInputPixels(0)
          // .max()
          .toFile(thumbnailFullname)
          .then((data) => {
            fileList.push({
              extname: localFileList[idx].extname,
              type: localFileList[idx].type,
              size: localFileList[idx].size,
              folder: localFileList[idx].folder,
              name: localFileList[idx].name,
              thumbnail: thumbnailName
            })
            that.thumbnail(localFileList, idx + 1, fileList, type, next)
          })
          .catch((error) => {
            logger.error('sharp error:', JSON.stringify(error))
            next({code: 'S006', detail: JSON.stringify(error)})
          })
      } else {
        fileList.push({
          extname: localFileList[idx].extname,
          type: localFileList[idx].type,
          size: localFileList[idx].size,
          folder: localFileList[idx].folder,
          name: localFileList[idx].name,
          thumbnail: localFileList[idx].name
        })
        that.thumbnail(localFileList, idx + 1, fileList, type, next)
      }
    } else {
      fileList.push({
        extname: localFileList[idx].extname,
        type: localFileList[idx].type,
        size: localFileList[idx].size,
        folder: localFileList[idx].folder,
        name: localFileList[idx].name,
        thumbnail: null
      })
      that.thumbnail(localFileList, idx + 1, fileList, type, next)
    }
  }
  putToS3 (fileList, next) {
    if (conf.storagy.mode === 'local') {
      next(null)
      return
    }
    this.putOneSetToS3(fileList, 0, next)
  }
  putOneSetToS3 (fileList, idx, next) {
    let that = this
    if (idx > fileList.length - 1) {
      next(null)
      return
    }
    that.putOneFileToS3(fileList[idx].folder, fileList[idx].name, fileList[idx].type, (error) => {
      if (error) {
        next(error)
        return
      } else {
        if (fileList[idx].thumbnail && fileList[idx].name != fileList[idx].thumbnail) {
          that.putOneFileToS3(fileList[idx].folder, fileList[idx].thumbnail, fileList[idx].type, (error) => {
            if (error) {
              next(error)
              return
            } else {
              fs.rmdir(path.join(__dirname, '..', 'upload', fileList[idx].folder), (del_error) => {
                if (del_error) {
                  logger.error(fileList[idx].folder, '|', JSON.stringify(del_error))
                }
              })
              that.putOneSetToS3(fileList, idx + 1, next)
            }
          })
        } else {
          fs.rmdir(path.join(__dirname, '..', 'upload', fileList[idx].folder), (del_error) => {
            if (del_error) {
              logger.error(fileList[idx].folder, '|', JSON.stringify(del_error))
            }
          })
          that.putOneSetToS3(fileList, idx + 1, next)
        }
      }
    })
  }
  putOneFileToS3 (folder, filename, filetype, next) {
    if (!filename) {
      next(null)
      return
    }
    let sourceFile = path.join(__dirname, '..', 'upload', folder, filename)
    s3.putObject({
      Bucket: conf.storagy.bucket,
      Key: path.join(conf.storagy.upload, folder, filename),
      ACL: 'public-read',
      Body: fs.createReadStream(sourceFile),
      ContentType: filetype
    }).promise().then((data) => {
      utils.deleteFile(sourceFile, (del_error) => {
        if (del_error) {
          logger.error(sourceFile, '|', JSON.stringify(del_error))
        }
      })
      next(null, data)
    }).catch((error) => {
      logger.error('s3.putObject error:', JSON.stringify(error))
      next({code: 'S004', detail: JSON.stringify(error)})
    })
  }
}

export default new FileService()
