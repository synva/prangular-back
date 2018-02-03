import * as log4js from 'log4js'
import conf from 'config'

log4js.configure(conf.logger)

export default log4js.getLogger('system')
