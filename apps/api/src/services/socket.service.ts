import { Server as SocketServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { verifyAccessToken } from './jwt.service'

let io: SocketServer | null = null

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Middleware auth
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Token requis'))
    }
    try {
      const payload = verifyAccessToken(token)
      socket.data.userId = payload.userId
      socket.data.role = payload.role
      next()
    } catch {
      next(new Error('Token invalide'))
    }
  })

  io.on('connection', (socket) => {
    const { userId, role } = socket.data
    console.log(`Socket connecté: ${userId} (${role})`)

    // Rejoindre une room personnelle
    socket.join(`user:${userId}`)

    // Praticien rejoint sa room
    if (role === 'PRATICIEN') {
      socket.join(`praticien:${userId}`)
    }

    // Rejoindre la room d'une mission
    socket.on('mission:join', (missionId: string) => {
      socket.join(`mission:${missionId}`)
      console.log(`${userId} a rejoint mission:${missionId}`)
    })

    // Quitter la room d'une mission
    socket.on('mission:leave', (missionId: string) => {
      socket.leave(`mission:${missionId}`)
    })

    // Mise à jour position praticien
    socket.on('praticien:position', (data: { missionId: string; latitude: number; longitude: number }) => {
      // Diffuser aux patients qui suivent cette mission
      socket.to(`mission:${data.missionId}`).emit('praticien:position', {
        latitude: data.latitude,
        longitude: data.longitude,
        updatedAt: new Date().toISOString(),
      })
    })

    socket.on('disconnect', () => {
      console.log(`Socket déconnecté: ${userId}`)
    })
  })

  return io
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.io non initialisé')
  return io
}

// Émettre un événement à tous les membres d'une mission
export function emitToMission(missionId: string, event: string, data: unknown): void {
  if (!io) return
  io.to(`mission:${missionId}`).emit(event, data)
}

// Émettre à un utilisateur spécifique
export function emitToUser(userId: string, event: string, data: unknown): void {
  if (!io) return
  io.to(`user:${userId}`).emit(event, data)
}