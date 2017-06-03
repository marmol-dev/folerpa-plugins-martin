//@flow

const folerpa = require('../../utils/folerpa')

const introducciones = [
    'Estas son algunas de las noticias más destacadas de hoy en Ourense',
    'Esto está pasando en Ourense',
    'Los titulares más importantes de hoy en Ourense son',
    'Los titulares de hoy son',
    'La actualidad de Ourense está marcada por'
]

module.exports.default = folerpa.createMiddleware(({ conversation }) => {
    return folerpa.scrapPage('http://www.laregion.es/seccion/ourense/')
        .then($ => {
            
            let titulos = $('h3.title').map((i, e) => {
                return $(e).text()
            }).get()

            titulos = titulos.slice(0, 5)

            return {
                text: `${folerpa.getRandomItem(introducciones)}:
                
${titulos.map(titulo => `- ${titulo}\n`).join('')}`,
                type: 1
            }
        })
})