import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'

let socket: Socket | null = null

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket

  const token = await SecureStore.getItemAsync('waluma_access_token')
  if (!token) throw new Error('Non authentifié')

  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('Socket connecté:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket déconnecté:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('Socket erreur:', error.message)
  })

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinMission(missionId: string): void {
  socket?.emit('mission:join', missionId)
}

export function leaveMission(missionId: string): void {
  socket?.emit('mission:leave', missionId)
}

export function emitPosition(missionId: string, latitude: number, longitude: number): void {
  socket?.emit('praticien:position', { missionId, latitude, longitude })
}