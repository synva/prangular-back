import logger from '../services/logger.js'
import socketService from '../services/socketService.js'

class SocketRouter {
  constructor () {
    this.io = null
  }
  init (server, session) {
    let that = this
    that.io = require('socket.io')(server)

    that.io.use((socket, next) => {
      session(socket.request, socket.request.res, next)
    })

    that.io.on('connection', (socket) => {
      logger.info('connected:', socket.id)
      if (socket.request && socket.request.session && socket.request.session.passport && socket.request.session.passport.user) {
        logger.debug('socket session:', socket.request.session.passport.user._id)
      }
      let client = socketService.login(socket)
      socketService.spy()

      socket.on('reinit', (params) => {
        logger.info(socket.id, 'reinit:', JSON.stringify(params))
        socketService.recovery(client, params)
        socket.emit('reinited', {})
        socketService.spy()
      })

      socket.on('enterLobby', (params) => {
        logger.info('enterLobby:', socket.id, '|', JSON.stringify(params))
        that.checkAuth(socket, () => {
          if (socketService.enterLobby(client)) {
            socketService.spy()
          }
        })
      })

      socket.on('enterChatRoom', (params) => {
        logger.info('enterChatRoom:', socket.id, '|', JSON.stringify(params))
        that.checkAuth(socket, () => {
          if (socketService.enterChatRoom(client)) {
            // chatService.getChats((error, chats, count) => {
            //   if (error) {
            //     socket.emit('processError', error)
            //   }
            //   else {
            //     socket.emit('initChatRoom', {chats: chats, count: count})
            //   }
            // })
            socketService.spy()
          }
        })
      })

      socket.on('sendChat', (params) => {
        logger.info('sendChat:', JSON.stringify(params))
        that.checkAuth(socket, () => {
          that.io.emit('receiveChat', params)
        })
      })

      socket.on('disconnect', () => {
        socketService.logout(client)
        socketService.spy()
      })
    })
    logger.debug('socket init ok!')
  }
  checkAuth (socket, next) {
    if (socket.request && socket.request.session && socket.request.session.passport && socket.request.session.passport.user) {
      next()
    } else {
      socket.emit('authenticateError', {})
    }
  }
}

export default new SocketRouter()



// // sending to sender-client only
// socket.emit('message', 'begin game')

// // sending to all clients, include sender
// io.emit('message', 'join game')

// // sending to all clients except sender
// socket.broadcast.emit('message', 'enemy comes in')

// // sending to all clients in 'game' room(channel) except sender
// socket.broadcast.to('game').emit('message', 'nice game')

// // sending to all clients in 'game' room(channel), include sender
// io.in('game').emit('message', 'cool game')

// // sending to sender client, only if they are in 'game' room(channel)
// socket.to('game').emit('message', 'enjoy the game')

// // sending to all clients in namespace 'myNamespace', include sender
// io.of('myNamespace').emit('message', 'gg')

// // sending to individual socketid
// socket.broadcast.to(socketid).emit('message', 'for your eyes only')
