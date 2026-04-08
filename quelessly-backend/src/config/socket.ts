import { Server as HttpServer } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'

let io: SocketServer

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // Vendor joins their own room to receive order notifications
    socket.on('join_vendor', (vendorId: string) => {
      socket.join(`vendor_${vendorId}`)
      console.log(`Vendor ${vendorId} joined room`)
    })

    // Student joins order room to track status
    socket.on('join_order', (orderId: string) => {
      socket.join(`order_${orderId}`)
      console.log(`Student joined order room: ${orderId}`)
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

// Call this anywhere to emit events
export const getIO = (): SocketServer => {
  if (!io) throw new Error('Socket not initialized')
  return io
}