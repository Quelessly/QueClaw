import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (typeof window === 'undefined') return null as any

  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://queclaw-production-0da0.up.railway.app'
    if (!url) return null as any

    socket = io(url, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,    // ✅ never give up
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,       // ✅ cap backoff at 10s
    })

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
    })
  }

  return socket
}