//@flow

const axios = require('axios')
const cheerio = require('cheerio')


module.exports.getRandomItem = function getRandomItem(array/*:any[]*/) {
    return array[Math.floor(Math.random() * array.length)]
}

module.exports.scrapPage = function scrapPage(url) {
    return axios.get(url)
        .then(response => {
            return cheerio.load(response.data)
        })
}

module.exports.createMiddleware = function createMiddleware(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req.body))
            .then(
                data => res.json(data),
                err => res.sendStatus(500)
            )
    }
}