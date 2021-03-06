import logger from './logger.js'

class Client {
  constructor (socket) {
    this.socket = socket
    this.room = null
  }
  equal (client) {
    return client && client.socket && client.socket.id === this.socket.id
  }
  changeRoom (room) {
    this.room = room
  }
  recovery (oldclient) {
    oldclient.room.enter(this)
    oldclient.destroy()
    oldclient = null
  }
  destroy () {
    if (this.room) {
      this.socket.leave(this.room.id)
      this.room.exit(this)
      this.room = null
    }
    this.socket = null
  }
  spy () {
    logger.debug('  ' + this.socket.id)
  }
}

export default Client
