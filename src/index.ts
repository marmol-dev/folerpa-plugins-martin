import app from './express'

const PORT = 4006

app.listen(PORT, err => {
    if (err) {
        console.error(err)
    } else {
        console.log(`Plugins listening on port ${PORT}`)
    }
})