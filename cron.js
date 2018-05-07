const exec = require('child_process').exec
const log4js = require('log4js')

let logger = log4js.getLogger('system')

exec('./backup_log2s3.sh', (err, stdout, stderr) => {
  if (err) {
    logger.error(err)
  }
  logger.info(stdout)
})
