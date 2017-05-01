//@flow

const app = require('express')()
const {inspect} = require('util')
const cheerio = require('cheerio')
const axios = require('axios')

const PORT = 4001

app.use(require('body-parser').json())

app.use(require('morgan')('combined'))

function getChiste(html, indice) {
    const $ = cheerio.load(html)
    const eq = indice + 3
    return $('#wrapper > div').eq(12).find('p').eq(0).text().trim()
}

function getMejorChiste(nPagina, indice){
    const url = 'http://www.chistescortos.eu/top?page=' + (nPagina + 1)

    return axios.get(url)
        .then(response => {
            if (response.data) {
                return getChiste(response.data, indice)
            } else {
                return Promise.reject()
            }
        })
}

app.post('/',
    (req, res, next) => {
        console.log('new request', inspect(req.body, {depth: 10}))

        const indice = Math.floor(Math.random() * 10)
        const pagina = Math.floor(Math.random() * 40)

        console.log(indice, pagina)

        getMejorChiste(indice, pagina)
            .then(chiste => {
                res.json({
                    text: chiste,
                    type: 1
                })
            })
            .catch(err => {
                console.error('error', err)
                res.sendStatus(500)
            })
    }
)

app.listen(PORT, err => {
    if (err) {
        console.error(err)
    } else {
        console.log(`Plugin listening on port ${PORT}`)
    }
})