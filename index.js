const express = require('express')
const http = require('http')
const socket = require('socket.io')

const app = express()
app.use(express.static(__dirname + '/./public'))

const server = http.createServer(app)
const io = socket(server, {
    path: '/socket.io'
})

const clients = []

io.on('connection', (client) => {
    console.log(`${clients.length} clientes conectados!`)
    clients.push(client)

    client.on('disconnect', () => {
        console.log(`${clients.length} clientes conectados!`)
        clients.splice(clients.indexOf(client), 1)
    })
})

server.listen(3000, () => {
    console.log('Socket iniciado!')
})

let serverTime = 0
setInterval(() => {
    serverTime++

    const hours = Math.floor(serverTime / 3600);
    const minutes = Math.floor(serverTime % 3600 / 60);
    const seconds = Math.floor((serverTime % 3600) % 60)

    console.log(`${hours} : ${minutes} : ${seconds}`)
}, 1000);

setInterval(() => {
    const times = []
    for (const client of clients) {
        client.emit('requestSignal', '')

        client.once('responseSignal', (clientTime) => {
            times.push(clientTime - serverTime)

            if (times.length == clients.length) calcMedia(times)
        })
    }
}, 3000);


const calcMedia = (times) => {
    let soma = 0
    for (const time of times) soma += time;
    const media = soma / times.length

    setTime(media)
}

const setTime = (media) => {
    serverTime += media
    io.emit('updateTime', serverTime)
}