import { WebPages, Random, Middleware, Text } from '../../utils/folerpa'

const introducciones = [
    'Estas son algunas de las noticias más destacadas de hoy en Ourense',
    'Esto está pasando en Ourense',
    'Los titulares más importantes de hoy en Ourense son',
    'Los titulares de hoy son',
    'La actualidad de Ourense está marcada por'
]

interface INoticia {
    titulo: string,
    resumen: string,
    urlImagen?: string,
    url: string
}

class NoticiasRepository {
    static async findAll(limit: number = Infinity): Promise<INoticia[]> {
        const $ = await WebPages.scrape('http://www.laregion.es/seccion/ourense/')

        return <any>$('.onm-new')
            .map((_, article) => {
                const pathImagen = $('.article-media img', article).attr('src')
                let urlImagen

                if (pathImagen) {
                    if (pathImagen.startsWith('/')) {
                        urlImagen = `http://laregion.es${pathImagen}`
                    } else {
                        urlImagen = pathImagen
                    }
                }

                return {
                    titulo: $('h3.title', article).text().trim(),
                    resumen: $('.summary', article).text().trim(),
                    urlImagen,
                    url: `http://laregion.es${$('h3.title > a', article).attr('href')}`
                }
            })
            .get()
            .slice(0, limit)
    }

    static async findByTema(tema: string): Promise<INoticia[]> {
        const todas = await this.findAll()

        const confidences = todas.map(noticia => ({
            noticia,
            confidence: (Text.confidence(noticia.titulo, tema) * 3 +
                Text.confidence(noticia.resumen, tema)) / 4
        }))

        const confidencesSorted = confidences.sort((a, b) => {
            return b.confidence - a.confidence
        })

        const confidencesSeleccionadas = confidencesSorted.filter(conf => conf.confidence > 0.6)

        const noticiasSeleccionadas = confidencesSeleccionadas.map(c => c.noticia)

        return noticiasSeleccionadas
    }
}

export default Middleware.create([
    {
        intent: 'get_noticias',
        entities: [
            'tema'
        ],
        async run(request, intent, { tema }) {

            try {
                const [noticia] = await NoticiasRepository.findByTema(tema[0].value)

                if (noticia) {

                    const baseText = `He encontrado una noticia relacionada con el tema:\n\n${noticia.titulo}\n\n${noticia.resumen}`
                    const speakText = baseText
                    const text = `${baseText}\n\n${noticia.url}`

                    let imageUrl

                    if (noticia.urlImagen) {
                        console.log('urlI', noticia.urlImagen)
                        imageUrl = noticia.urlImagen
                    }


                    return {
                        text,
                        type: 1,
                        imageUrl,
                        speakText
                    }

                } else {
                    return {
                        text: Random.response([
                            () => `No me he enterado de nada relacionado con "${tema[0].value}" 😞`,
                            () => `En la redacción aún no me han hablado de nada relacionado con "${tema[0].value}"`,
                            () => `Aún no tengo noticias de "${tema[0].value}"`,
                            () => `No sé todavía qué pasó con "${tema[0].value}"`
                        ]),
                        type:1
                    }
                }

            } catch (e) {
                console.error('error', e)
                throw e
            }
        }
    },
    {
        intent: 'get_noticias',
        async run(request) {

            const noticias = await NoticiasRepository.findAll(5)

            const titularesStr = noticias.map(({ titulo }) => `- ${titulo}\n`).join('')

            const noticiaImagen = noticias.find(noticia => Boolean(noticia.urlImagen))

            let imageUrl

            if (noticiaImagen) {
                imageUrl = noticiaImagen.urlImagen
            }

            const text = `${Random.item(introducciones)}\n${titularesStr}`

            return {
                text,
                type: 1,
                imageUrl
            }
        }
    }
])