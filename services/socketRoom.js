import logger from './logger.js'
import uuid from 'uuid'

class Room {
  constructor (name) {
    this.id = uuid.v4()
    this.name = name || 'room'
    this.clients = []
  }
  equal (room) {
    return room.id === this.id
  }
  enter (client) {
    if (client.room) {
      if (client.room.equal(this)) {
        return false
      }
      client.room.exit(client)
    }
    client.socket.join(this.id)
    this.clients.push(client)
    client.changeRoom(this)
    return true
  }
  exit (client) {
    for (let i = 0; i < this.clients.length; i ++) {
      if (this.clients[i].equal(client)) {
        logger.debug(client.socket.id, 'exit room:', this.name)
        client.socket.leave(this.id)
        client.changeRoom(null)
        this.clients.splice(i, 1)
        break
      }
    }
  }
  recovery (client, params) {
    for (let i = 0; i < this.clients.length; i ++) {
      if (params && this.clients[i].socket.id === params.oldSocketID) {
        client.recovery(this.clients[i])
        this.clients.splice(i, 1)
        break
      }
    }
  }
  spy () {
    logger.debug(this.name, ':', this.id, '|', this.clients.length)
    this.clients.forEach(client => {
      client.spy()
    })
    logger.debug('======================================================================')
  }
}

export default Room
