//@flow

const app = require('express')()
const {inspect} = require('util')
const cheerio = require('cheerio')
const axios = require('axios')

const PORT = 4001

app.use(require('body-parser').json())

app.use(require('morgan')('combined'))

function removeLine(text, repeat = 1) {
    const sliced = text.split('\n').slice(repeat)
    return sliced.join('\n')
}

function getChiste(html, indice) {
    const $ = cheerio.load(html)
    const eq = indice + 3
    let text = $('.content').eq(indice).text()
    
    const cleanText = removeLine(text, 8).trim()
        .replace(/\n{2,}/g, '\n')
        .replace(/  +/g, ' ');

    return cleanText 
}

function getMejorChiste(nPagina, indice){
    const url = 'http://www.periodicoelgancho.com/chistes/chistes-buenos/page/' + (nPagina + 1)

    return axios.get(url)
        .then(response => {
            if (response.data) {
                return getChiste(response.data, indice)
            } else {
                return Promise.reject()
            }
        })
}

const introduciones = [
    'Ahí va uno:',
    'A ver que te parece:',
    'Me contaron uno muy bueno:',
    'Ahí va uno gracioso:',
    'Este es es muy bueno:'
]

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

app.post('/',
    (req, res, next) => {
        console.log('new request', inspect(req.body, {depth: 10}))

        const indice = Math.floor(Math.random() * 8)
        const pagina = Math.floor(Math.random() * 19)

        console.log(indice, pagina)

        getMejorChiste(pagina, indice)
            .then(chiste => {
                res.json({
                    text: `${getRandom(introduciones)}\n${chiste}`,
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