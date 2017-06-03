//@flow

const app = require('express')()
const {inspect} = require('util')
const cheerio = require('cheerio')
const axios = require('axios')

const PORT = 4006

app.use(require('body-parser').json())
app.use(require('morgan')('combined'))


app.post('/la-region', require('./plugins/la-region').default)
app.post('/eathy', require('./plugins/eathy').default)

app.listen(PORT, err => {
    if (err) {
        console.error(err)
    } else {
        console.log(`Plugin listening on port ${PORT}`)
    }
})