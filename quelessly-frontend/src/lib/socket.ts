import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (typeof window === 'undefined') return null as any

  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://queclaw-production.up.railway.app'
    
    if (!url) return null as any

    socket = io(url, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
    })
  }

  return socket
}