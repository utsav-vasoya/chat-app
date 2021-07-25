
const socket = io();

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = document.querySelector('#messages').lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = document.querySelector('#messages').offsetHeight

    // Height of messages container
    const containerHeight =document.querySelector('#messages').scrollHeight

    // How far have I scrolled?
    const scrollOffset = document.querySelector('#messages').scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        document.querySelector('#messages').scrollTop =document.querySelector('#messages').scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    document.querySelector('#messages').insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationmessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate, {
        username:message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    document.querySelector('#messages').insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

document.querySelector("#form").addEventListener('submit', (e) => {
    e.preventDefault()
    document.querySelector("#form").querySelector('button').setAttribute('disabled', 'disabled')

    const message = document.querySelector('input').value;
    socket.emit('sendMessage', message, () => {
        document.querySelector("#form").querySelector('button').removeAttribute('disabled')
        console.log('message deliverd');

    })
    document.querySelector('#form').reset()
})

document.querySelector("#location").addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported in your browser!')
    }
    document.querySelector("#location").setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            document.querySelector("#location").removeAttribute('disabled')
            console.log('Locaion shared!');

        })

    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})