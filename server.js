import express from 'express'
import http from 'node:http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()
const httpServer = http.createServer(app)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.set('view engine', 'ejs')
app.set('views', 'public/views')
app.use('/static', express.static('public'))

app.get(['/', '/login'], (_, response) => {
  response.render('login')
})

app.post('/login', (request, response) => {
  const { body } = request
  const { username } = body
  response.render('chat', {
    username
  })
})

app.get('/chat', (request, response) => {
  const { username } = request.query
  response.render('chat', { username })
})

const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
})

io.on('connection', (socket) => {
  const username = socket.handshake.query.username
  console.log(`User connected: ${username}`)

  socket.emit('session', { username })

  socket.on('message', (data) => {
    socket.broadcast.emit('message-received', {
      message: data,
      from: {
        id: socket.id,
        username,
      }
    })
  })
})

httpServer.listen(PORT, () => {
  console.log(`Connection up! 🚀 PORT: ${PORT}`)
})
