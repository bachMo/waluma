import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
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

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Initialiser Socket.io
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

const PORT = process.env.PORT || 5001
httpServer.listen(PORT, () => {
  console.log(`API + WebSocket running on port ${PORT}`)
})

export default app