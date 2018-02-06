import logger from './logger.js'
import conf from 'config' // eslint-disable-line no-unused-vars
import mongo from './mongo.js' // eslint-disable-line no-unused-vars

class Client {
  constructor(socket) {
    this.socket = socket
    this.room = null
  }
  equal(client) {
    return client && client.socket && client.socket.id === this.socket.id
  }
  changeRoom(room) {
    this.room = room
  }
  recovery(oldclient, params) { // eslint-disable-line no-unused-vars
    oldclient.room.enter(this)
    oldclient.destroy()
    oldclient = null
  }
  destroy() {
    if (this.room) {
      this.socket.leave(this.room.id)
      this.room.exit(this)
      this.room = null
    }
    // this.socket.destroy()
    this.socket = null
  }
  spy() {
    logger.debug('  ' + this.socket.id)
  }
}

export default Client
