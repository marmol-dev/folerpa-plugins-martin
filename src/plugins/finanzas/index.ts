import { Random, Middleware, Text, WebPages } from '../../utils/folerpa'

interface IRate {
    name: string,
    price: number,
    direction: 'ASC'|'DESC',
    variationPercentage: number,
    variationPrice: number,
    volume: number,
    capitalization: number
}

interface IRatesInfo {
    points: number,
    graphicUrl: string,
    rates: IRate[]
}

class RatesRepository {
    constructor(private _indice : string) {}

    async getPoints() : Promise<number> {
        const ratesInfo = await this.getRatesInfo()

        console.log('ratesInfo', ratesInfo)

        return ratesInfo.points
    }

    async findOneByName(name : string) : Promise<IRate> {
        const ratesInfo = await this.getRatesInfo()

        name = Text.withoutTildes(name.toLowerCase())

        return ratesInfo.rates.find(rate => {
            return !!Text.withoutTildes(rate.name.toLocaleLowerCase()).match(name)
        })
    }

    async getRatesInfo() : Promise<IRatesInfo> {
        const $ = await WebPages.scrape(`http://www.eleconomista.es/indice/${this._indice}`)

        const points = Number($('span.ultimo_117').text().replace('.', '').replace(',','.'))

        const rows = <any> $('.tablalista tr')
            .map((index, tr) => $(tr))
            .get()

        const rates = rows
            .slice(1, rows.length - 1)    
            .map(($tr: any) => {
                const col = (n: number) => $tr.find('td').eq(n)
                const text = (n: number) => col(n).text()
                const number = (n: number) => parseFloat(text(n)
                    .replace(/\./g, '')
                    .replace(/\,/g, '.'))

                return {
                    name: text(0),
                    price: number(1),
                    direction: 'ASC',
                    variationPercentage: number(3),
                    variationPrice: number(4),
                    volume: number(5),
                    capitalization: number(6)
                }
            })

        const graphicUrl = 'http://www.eleconomista.es' + $('.graf-int > a > img').attr('src')

        return {
            points,
            rates,
            graphicUrl
        }
    }
    

    static getIndiceNormalizado(indice : string) {
        indice = indice.toLowerCase().replace(/ /g, '')

        switch(indice) {
            case 'ibex35':
            case 'ibex':
                return 'IBEX-35'
        }
    }
}

export default Middleware.create([
    {
        intent: 'get_puntos',
        entities: [
            'indice'
        ],
        async run(request, intent, { indice }) {
            const indiceNormalizado = RatesRepository.getIndiceNormalizado(indice[0].value)
            
            const ratesRepository = new RatesRepository(indiceNormalizado)

            const ratesInfo = await ratesRepository.getRatesInfo()

            const imageUrl = ratesInfo.graphicUrl
            const points = ratesInfo.points.toFixed(0)

            const text = Random.response([
                () => `El ${indiceNormalizado} está en ${points} puntos`
            ])

            return {
                text,
                imageUrl,
                type: 1
            }
        }
    },
    {
        intent: 'get_precio_accion',
        entities: [
            'empresa'
        ],
        async run(request, intent, { indice, empresa }) {
            const index = (indice && indice[0].value) || 'ibex'

            const corporation = empresa[0].value

            const indexNormalized = RatesRepository.getIndiceNormalizado(index)
            
            const ratesRepository = new RatesRepository(indexNormalized)

            const rate = await ratesRepository.findOneByName(corporation)

            let text
            let type

            if (!rate) {
                type = 2
                text = Random.response([
                    () => `La empresa ${corporation} no aparece en el índice ${indexNormalized} 😕`,
                    () => `No encuentro a ${corporation} en el ${indexNormalized} 😕`
                ])
            } else {
                type = 1
                text = Random.response([
                    () => `Las acciones de ${rate.name} están a ${rate.price.toFixed(2)}€`,
                    () => `Una acción de ${rate.name} cuesta ${rate.price.toFixed(2)}€`
                ])
            }

            return {
                text,
                type
            }
        }
    },
    {
        intent: 'get_varacion_accion',
        entities: [
            'empresa'
        ],
        async run(request, intent, { indice, empresa }) {
            console.log('empresa', empresa)

            const index = (indice && indice[0].value) || 'ibex'

            const corporation = empresa[0].value

            const indexNormalized = RatesRepository.getIndiceNormalizado(index)
            
            const ratesRepository = new RatesRepository(indexNormalized)

            const rate = await ratesRepository.findOneByName(corporation)

            let text
            let type

            if (!rate) {
                type = 2
                text = Random.response([
                    () => `La empresa ${corporation} no aparece en el índice ${indexNormalized} 😕`,
                    () => `No encuentro a ${corporation} en el ${indexNormalized} 😕`
                ])
            } else {
                const tipoVariacion = rate.variationPrice > 0 ? 'subido' : 'bajado'

                type = 1
                text = Random.response([
                    () => `Las acciones de ${rate.name} han ${tipoVariacion} ${Math.abs(rate.variationPrice).toFixed(2)}€. Ahora mismo están a ${rate.price.toFixed(2)}€.`
                ])
            }

            return {
                text,
                type
            }
        }
    }
])