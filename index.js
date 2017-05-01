//@flow

const app = require('express')()
const {inspect} = require('util')

const PORT = 4000

app.use(require('body-parser').json())

app.use(require('morgan')('combined'))

const sentences = [
    'Un día de estos 😁',
    'Pues no sé chico 😔',
    'Pregúntaselo a él 😒',
]

const sentencesAfterResponse = [
    '¿Sabías que Hitler murió el 30 de Abril de 1945?',
    'Un dato interesante: el FCB se fundó el 29 de noviembre de 1899',
    'Ahí va un dato: Tokio es una de las ciudades más pobladas del mundo con 35 millones de habitantes en su zona metropolitana'
]

function randomSentence() {
    return sentences[Math.floor(Math.random() * sentences.length)]
}

function randomFactSentence() {
    return sentencesAfterResponse[Math.floor(Math.random() * sentences.length)]
}

app.post('/',
    (req, res, next) => {
        console.log('new request', inspect(req.body, {depth: 10}))

        if (req.body.conversation.messages.length > 1) {
            res.json({
                type: 3,
                text: `${randomFactSentence()}, ¿te gustaría saber otro dato curioso 😋?`
            })
        } else {
            res.json({
                type: 3,
                text: `${randomSentence()}, pero podemos seguir hablando si quieres 😉`
            })
        }
        
    }
)

app.listen(PORT, err => {
    if (err) {
        console.error(err)
    } else {
        console.log(`Plugin listening on port ${PORT}`)
    }
})