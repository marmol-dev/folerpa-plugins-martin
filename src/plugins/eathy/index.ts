import { WebPages, Random, Middleware, Text } from '../../utils/folerpa'
import * as Fatsecret from 'fatsecret'
import { inspect } from 'util'

interface IAlimento {
    nombre: string,
    energia: number,
    hidratosCarbono: number,
    grasas: number,
    proteinas: number
}

class AlimentosRepository {
    static async findByNombre(nombre : string) : Promise<IAlimento> {
        const $ = await WebPages.scrape(`http://www.dietasan.com/alimentos/informacionNutricional.aspx?alimento=${encodeURIComponent(Text.withoutTildes(nombre))}`)

        const t =  (fila: number) => Number($('#ctl00_ContentPlaceHolder1_InfoAlimento > table').eq(0).find('tr').eq(fila).find('td').eq(1).text().match(/\d+/)[0])

        return {
            nombre,
            energia: t(1),
            hidratosCarbono: t(2),
            grasas: t(3),
            proteinas: t(4)
        }
    }
}

export default Middleware.create([
    {
        entities: [
            'alimento',
            'articulo'
        ],
        intent: 'get_calorías',
        async run(request, intent, { alimento, articulo }) {
            const [{ value: nombreAlimento }] = alimento
            const [{ value: valorArticulo }] = articulo

            let text

            try {
                const alimento = await AlimentosRepository.findByNombre(nombreAlimento)

                text = `${Text.capitalize(valorArticulo)} ${nombreAlimento} tiene ${alimento.energia} Kcal por cada 100 gramos 💪`
            } catch (e) {
                text = `No conozco ${valorArticulo} ${nombreAlimento} 😞`
            }

            return {
                text,
                type: 1
            }

        }
    },
    {
        entities: [
            'alimento',
            'articulo'
        ],
        intent: 'get_proteinas',
        async run(request, intent, { alimento, articulo }) {
            const [{ value: nombreAlimento }] = alimento
            const [{ value: valorArticulo }] = articulo

            let text

            try {
                const alimento = await AlimentosRepository.findByNombre(nombreAlimento)

                text = Random.response([
                    () => `${Text.capitalize(valorArticulo)} ${alimento.nombre} tiene un ${alimento.proteinas}% de proteínas 💪`,
                    () => `${alimento.proteinas}g de cada 100 son proteínas en ${valorArticulo} ${alimento.nombre}`,
                    () => `De cada 100g, ${alimento.proteinas} son proteínas en ${valorArticulo} ${alimento.nombre}`
                ])
            } catch (e) {
                text = `No conozco ${valorArticulo} ${nombreAlimento} 😞`
            }

            return {
                text,
                type: 1
            }

        },
    },
    {
        entities: [
            'alimento',
            'articulo'
        ],
        intent: 'get_nutrientes',
        async run(request, intent, { alimento, articulo }) {
            const [{ value: nombreAlimento }] = alimento
            const [{ value: valorArticulo }] = articulo

            let text

            try {
                const alimento = await AlimentosRepository.findByNombre(nombreAlimento)

                const entradilla = Random.response([
                    () => `${Text.capitalize(valorArticulo)} ${alimento.nombre} está compuesto por los siguientes nutrientes por cada 100g:`,
                    () => `${Text.capitalize(valorArticulo)} ${alimento.nombre} tiene la siguiente información nutricional por cada 100g:`,
                    () => `En 100g de ${alimento.nombre} hay los siguientes nutrientes:`,
                ])

                const nutrientes = [
                    ['Energía', alimento.energia, 'Kcal'],
                    ['Proteínas', alimento.proteinas, 'g'],
                    ['Hidratos de carbono', alimento.hidratosCarbono, 'g'],
                    ['Grasas', alimento.grasas, 'g']
                ]

                const nutrientesTexto = nutrientes.map(([titulo, cantidad, unidad]) => `- ${titulo}: ${cantidad}${unidad}`).join('\n')

                text = `${entradilla}\n\n${nutrientesTexto}`
            } catch (e) {
                text = `No conozco ${valorArticulo} ${nombreAlimento} 😞`
            }

            return {
                text,
                type: 1
            }

        },
    }
])