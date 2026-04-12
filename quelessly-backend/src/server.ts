import './instrument'  // ✅ must be first line
import http from 'http'
import app from './app'
import { env } from './config/env'
import { initSocket } from './config/socket'

const httpServer = http.createServer(app)

initSocket(httpServer)

httpServer.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})