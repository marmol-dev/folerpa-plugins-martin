import { WebPages, Random, Middleware, Text } from '../../utils/folerpa'
import * as Fatsecret from 'fatsecret'
import { inspect } from 'util'

const fat = new Fatsecret('8a7ac9e6ae6c4e1dabf1af3a67d76c8a', 'f13776c9c23a4006bfe5787e42cad35e')

async function getCaloriesFood(foodName: string): Promise<number> {

    const url = `http://www.dietasan.com/alimentos/informacionNutricional.aspx?alimento=${encodeURIComponent(Text.withoutTildes(foodName))}`

    console.log(url)

    const $ = await WebPages.scrape(url)

    const result = $('#ctl00_ContentPlaceHolder1_InfoAlimento > table').eq(0).find('tr').eq(1).find('td').eq(1).text()

    const kcals = parseInt(result.match(/\d+/)[0])

    return kcals
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
            const [{value: valorArticulo}] = articulo

            let text

            try {
                const calorias = await getCaloriesFood(nombreAlimento)

                text = `${Text.capitalize(valorArticulo)} ${nombreAlimento} tiene ${calorias} Kcal por cada 100 gramos 💪`
            } catch (e) {
                text = `No conozco ${valorArticulo} ${nombreAlimento} 😞`
            }

            return {
                text,
                type: 1
            }

        }
    }
])