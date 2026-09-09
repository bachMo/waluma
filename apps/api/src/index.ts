import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { execSync } from 'child_process'
import { initSocket } from './services/socket.service'
import authRoutes from './routes/auth.routes'
import praticienRoutes from './routes/praticien.routes'
import missionRoutes from './routes/mission.routes'
import articleRoutes from './routes/article.routes'
import parametreRoutes from './routes/parametre.routes'
import litigeRoutes from './routes/litige.routes'
import statsRoutes from './routes/stats.routes'
import notificationRoutes from './routes/notification.routes'
import paiementRoutes from "./routes/paiement.routes"
import avisPraticienRoutes from './routes/avis.routes'
import demandeRoutes from './routes/demande.routes'

dotenv.config()

const app = express()
const httpServer = createServer(app)

initSocket(httpServer)

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Waluma API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/praticiens', praticienRoutes)
app.use('/api/missions', missionRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/parametres', parametreRoutes)
app.use('/api/litiges', litigeRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/notifications', notificationRoutes)
app.use("/api/paiements", paiementRoutes)
app.use('/api/avis', avisPraticienRoutes)
app.use('/api/demandes', demandeRoutes)

const PORT = Number(process.env.PORT) || 5001

function killPort(port: number) {
  try {
    execSync(
      `FOR /F "tokens=5" %P IN ('netstat -ano ^| findstr :${port} ^| findstr LISTENING') DO taskkill /PID %P /F`,
      { shell: 'cmd.exe', stdio: 'ignore' }
    )
    console.log(`[startup] Port ${port} libéré.`)
  } catch (_) {
    // Rien à tuer, on continue
  }
}

function startServer() {
  httpServer.listen(PORT, () => {
    console.log(`API + WebSocket running on port ${PORT}`)
  })

  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[error] Port ${PORT} occupé — tentative de libération...`)
      killPort(PORT)
      setTimeout(() => {
        httpServer.close()
        startServer()
      }, 1000)
    } else {
      console.error('[error] Erreur serveur inattendue:', err)
      process.exit(1)
    }
  })
}

startServer()

export default app