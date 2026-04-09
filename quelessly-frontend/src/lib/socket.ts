import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (typeof window === 'undefined') {
    throw new Error('Socket can only be used client-side')
  }
  
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://queclaw-production.up.railway.app'
    socket = io(url, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })
  }
  
  return socket
}